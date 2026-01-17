import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useAuthFlow } from "./use-auth-flow"

// Mock the server actions
vi.mock("@/app/actions/substack-auth", () => ({
  emailLogin: vi.fn(),
  verifyEmailOtp: vi.fn(),
  verifyMfa: vi.fn(),
}))

import { emailLogin, verifyEmailOtp, verifyMfa } from "@/app/actions/substack-auth"

const mockEmailLogin = vi.mocked(emailLogin)
const mockVerifyEmailOtp = vi.mocked(verifyEmailOtp)
const mockVerifyMfa = vi.mocked(verifyMfa)

describe("useAuthFlow", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe("initial state", () => {
    it("should start with email step", () => {
      const { result } = renderHook(() => useAuthFlow())

      expect(result.current.state.currentStep).toBe("email")
      expect(result.current.state.status).toBe("idle")
      expect(result.current.state.email).toBe("")
      expect(result.current.state.token).toBe("")
      expect(result.current.state.error).toBeNull()
    })

    it("should have empty verification code array", () => {
      const { result } = renderHook(() => useAuthFlow())

      expect(result.current.state.verificationCode).toEqual(["", "", "", "", "", ""])
    })

    it("should have empty history", () => {
      const { result } = renderHook(() => useAuthFlow())

      expect(result.current.state.history).toEqual([])
    })

    it("should not be loading initially", () => {
      const { result } = renderHook(() => useAuthFlow())

      expect(result.current.isLoading).toBe(false)
    })

    it("should have correct initial step title", () => {
      const { result } = renderHook(() => useAuthFlow())

      expect(result.current.currentStepTitle).toBe("Sign in to Substack")
    })
  })

  describe("submitEmail", () => {
    it("should transition to verification step on success", async () => {
      mockEmailLogin.mockResolvedValue({ success: true, token: "test-token-123" })

      const { result } = renderHook(() => useAuthFlow())

      await act(async () => {
        await result.current.submitEmail("test@example.com")
      })

      expect(result.current.state.currentStep).toBe("verification")
      expect(result.current.state.email).toBe("test@example.com")
      expect(result.current.state.token).toBe("test-token-123")
      expect(result.current.state.status).toBe("success")
    })

    it("should set loading state during submission", async () => {
      let resolvePromise: (value: { success: boolean; token: string }) => void
      mockEmailLogin.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolvePromise = resolve
          })
      )

      const { result } = renderHook(() => useAuthFlow())

      act(() => {
        result.current.submitEmail("test@example.com")
      })

      expect(result.current.state.status).toBe("loading")
      expect(result.current.isLoading).toBe(true)

      await act(async () => {
        resolvePromise!({ success: true, token: "test-token" })
      })
    })

    it("should set error state on failure", async () => {
      mockEmailLogin.mockRejectedValue(new Error("Network error"))

      const { result } = renderHook(() => useAuthFlow())

      await act(async () => {
        await result.current.submitEmail("test@example.com")
      })

      expect(result.current.state.status).toBe("error")
      expect(result.current.state.error).toBe("Network error")
      expect(result.current.state.currentStep).toBe("email")
    })

    it("should handle missing token in response", async () => {
      mockEmailLogin.mockResolvedValue({ success: true, token: undefined })

      const { result } = renderHook(() => useAuthFlow())

      await act(async () => {
        await result.current.submitEmail("test@example.com")
      })

      expect(result.current.state.status).toBe("error")
      expect(result.current.state.error).toBe("No token received from email login")
    })

    it("should add to history on success", async () => {
      mockEmailLogin.mockResolvedValue({ success: true, token: "test-token" })

      const { result } = renderHook(() => useAuthFlow())

      await act(async () => {
        await result.current.submitEmail("test@example.com")
      })

      expect(result.current.state.history).toHaveLength(1)
      expect(result.current.state.history[0].step).toBe("verification")
      expect(result.current.state.history[0].action).toBe("EMAIL_SUBMIT_SUCCESS")
    })
  })

  describe("submitOtp", () => {
    beforeEach(async () => {
      mockEmailLogin.mockResolvedValue({ success: true, token: "initial-token" })
    })

    it("should transition to twoFactor step when MFA is required", async () => {
      mockVerifyEmailOtp.mockResolvedValue({
        success: true,
        mfaRequired: true,
        newToken: "mfa-token",
      })

      const { result } = renderHook(() => useAuthFlow())

      // First, submit email to get to verification step
      await act(async () => {
        await result.current.submitEmail("test@example.com")
      })

      // Then submit OTP
      await act(async () => {
        await result.current.submitOtp(["1", "2", "3", "4", "5", "6"])
      })

      expect(result.current.state.currentStep).toBe("twoFactor")
      expect(result.current.state.mfaRequired).toBe(true)
    })

    it("should join code array into string for API call", async () => {
      mockVerifyEmailOtp.mockResolvedValue({ success: true, newToken: "new-token" })

      const { result } = renderHook(() => useAuthFlow())

      await act(async () => {
        await result.current.submitEmail("test@example.com")
      })

      await act(async () => {
        await result.current.submitOtp(["1", "2", "3", "4", "5", "6"])
      })

      expect(mockVerifyEmailOtp).toHaveBeenCalledWith("123456", "test@example.com", "initial-token")
    })

    it("should set error state on OTP verification failure", async () => {
      mockVerifyEmailOtp.mockRejectedValue(new Error("Invalid code"))

      const { result } = renderHook(() => useAuthFlow())

      await act(async () => {
        await result.current.submitEmail("test@example.com")
      })

      await act(async () => {
        await result.current.submitOtp(["1", "2", "3", "4", "5", "6"])
      })

      expect(result.current.state.status).toBe("error")
      expect(result.current.state.error).toBe("Invalid code")
      expect(result.current.state.currentStep).toBe("verification")
    })
  })

  describe("submitMfa", () => {
    beforeEach(async () => {
      mockEmailLogin.mockResolvedValue({ success: true, token: "initial-token" })
      mockVerifyEmailOtp.mockResolvedValue({ success: true, newToken: "otp-token" })
    })

    it("should transition to token step on MFA success", async () => {
      mockVerifyMfa.mockResolvedValue({ success: true, token: "final-token" })

      const { result } = renderHook(() => useAuthFlow())

      // Navigate through email and OTP steps
      await act(async () => {
        await result.current.submitEmail("test@example.com")
      })
      await act(async () => {
        await result.current.submitOtp(["1", "2", "3", "4", "5", "6"])
      })

      // Submit MFA
      await act(async () => {
        await result.current.submitMfa("654321")
      })

      expect(result.current.state.currentStep).toBe("token")
      expect(result.current.state.token).toBe("final-token")
      expect(result.current.state.status).toBe("success")
    })

    it("should set error state on MFA failure response", async () => {
      mockVerifyMfa.mockResolvedValue({ success: false, error: "Invalid MFA code" })

      const { result } = renderHook(() => useAuthFlow())

      await act(async () => {
        await result.current.submitEmail("test@example.com")
      })
      await act(async () => {
        await result.current.submitOtp(["1", "2", "3", "4", "5", "6"])
      })
      await act(async () => {
        await result.current.submitMfa("654321")
      })

      expect(result.current.state.status).toBe("error")
      expect(result.current.state.error).toBe("Invalid MFA code")
      expect(result.current.state.currentStep).toBe("twoFactor")
    })

    it("should handle MFA network error", async () => {
      mockVerifyMfa.mockRejectedValue(new Error("Network timeout"))

      const { result } = renderHook(() => useAuthFlow())

      await act(async () => {
        await result.current.submitEmail("test@example.com")
      })
      await act(async () => {
        await result.current.submitOtp(["1", "2", "3", "4", "5", "6"])
      })
      await act(async () => {
        await result.current.submitMfa("654321")
      })

      expect(result.current.state.status).toBe("error")
      expect(result.current.state.error).toBe("Network timeout")
    })
  })

  describe("skipMfa", () => {
    beforeEach(async () => {
      mockEmailLogin.mockResolvedValue({ success: true, token: "initial-token" })
      mockVerifyEmailOtp.mockResolvedValue({ success: true, newToken: "otp-token" })
    })

    it("should transition to token step when skipping MFA", async () => {
      const { result } = renderHook(() => useAuthFlow())

      await act(async () => {
        await result.current.submitEmail("test@example.com")
      })
      await act(async () => {
        await result.current.submitOtp(["1", "2", "3", "4", "5", "6"])
      })

      act(() => {
        result.current.skipMfa()
      })

      expect(result.current.state.currentStep).toBe("token")
      expect(result.current.state.status).toBe("success")
    })

    it("should clear twoFactorCode when skipping", async () => {
      const { result } = renderHook(() => useAuthFlow())

      await act(async () => {
        await result.current.submitEmail("test@example.com")
      })
      await act(async () => {
        await result.current.submitOtp(["1", "2", "3", "4", "5", "6"])
      })

      act(() => {
        result.current.skipMfa()
      })

      expect(result.current.state.twoFactorCode).toBe("")
    })

    it("should add to history when skipping MFA", async () => {
      const { result } = renderHook(() => useAuthFlow())

      await act(async () => {
        await result.current.submitEmail("test@example.com")
      })
      await act(async () => {
        await result.current.submitOtp(["1", "2", "3", "4", "5", "6"])
      })

      act(() => {
        result.current.skipMfa()
      })

      const skipHistory = result.current.state.history.find((h) => h.action === "MFA_SKIP")
      expect(skipHistory).toBeDefined()
      expect(skipHistory?.step).toBe("token")
    })
  })

  describe("canSkipMfa", () => {
    beforeEach(async () => {
      mockEmailLogin.mockResolvedValue({ success: true, token: "initial-token" })
      mockVerifyEmailOtp.mockResolvedValue({ success: true, newToken: "otp-token" })
    })

    it("should return true when on twoFactor step with allowSkip enabled", async () => {
      const { result } = renderHook(() => useAuthFlow())

      await act(async () => {
        await result.current.submitEmail("test@example.com")
      })
      await act(async () => {
        await result.current.submitOtp(["1", "2", "3", "4", "5", "6"])
      })

      expect(result.current.canSkipMfa).toBe(true)
    })

    it("should return false when not on twoFactor step", () => {
      const { result } = renderHook(() => useAuthFlow())

      expect(result.current.canSkipMfa).toBe(false)
    })
  })

  describe("reset", () => {
    it("should reset all state to initial values", async () => {
      mockEmailLogin.mockResolvedValue({ success: true, token: "test-token" })

      const { result } = renderHook(() => useAuthFlow())

      await act(async () => {
        await result.current.submitEmail("test@example.com")
      })

      act(() => {
        result.current.reset()
      })

      expect(result.current.state.currentStep).toBe("email")
      expect(result.current.state.email).toBe("")
      expect(result.current.state.token).toBe("")
      expect(result.current.state.history).toEqual([])
      expect(result.current.state.status).toBe("idle")
    })
  })

  describe("retry", () => {
    it("should clear error and set status to idle", async () => {
      mockEmailLogin.mockRejectedValue(new Error("Network error"))

      const { result } = renderHook(() => useAuthFlow())

      await act(async () => {
        await result.current.submitEmail("test@example.com")
      })

      expect(result.current.state.status).toBe("error")
      expect(result.current.state.error).toBe("Network error")

      act(() => {
        result.current.retry()
      })

      expect(result.current.state.status).toBe("idle")
      expect(result.current.state.error).toBeNull()
    })

    it("should preserve current step on retry", async () => {
      mockEmailLogin.mockResolvedValue({ success: true, token: "test-token" })
      mockVerifyEmailOtp.mockRejectedValue(new Error("Invalid OTP"))

      const { result } = renderHook(() => useAuthFlow())

      await act(async () => {
        await result.current.submitEmail("test@example.com")
      })
      await act(async () => {
        await result.current.submitOtp(["1", "2", "3", "4", "5", "6"])
      })

      act(() => {
        result.current.retry()
      })

      expect(result.current.state.currentStep).toBe("verification")
    })
  })

  describe("step titles", () => {
    beforeEach(async () => {
      mockEmailLogin.mockResolvedValue({ success: true, token: "test-token" })
      mockVerifyEmailOtp.mockResolvedValue({ success: true, newToken: "otp-token" })
      mockVerifyMfa.mockResolvedValue({ success: true, token: "final-token" })
    })

    it("should return correct title for email step", () => {
      const { result } = renderHook(() => useAuthFlow())
      expect(result.current.currentStepTitle).toBe("Sign in to Substack")
    })

    it("should return correct title for verification step", async () => {
      const { result } = renderHook(() => useAuthFlow())

      await act(async () => {
        await result.current.submitEmail("test@example.com")
      })

      expect(result.current.currentStepTitle).toBe("Check your email to continue")
    })

    it("should return correct title for twoFactor step", async () => {
      const { result } = renderHook(() => useAuthFlow())

      await act(async () => {
        await result.current.submitEmail("test@example.com")
      })
      await act(async () => {
        await result.current.submitOtp(["1", "2", "3", "4", "5", "6"])
      })

      expect(result.current.currentStepTitle).toBe("Two-factor authentication")
    })

    it("should return correct title for token step", async () => {
      const { result } = renderHook(() => useAuthFlow())

      await act(async () => {
        await result.current.submitEmail("test@example.com")
      })
      await act(async () => {
        await result.current.submitOtp(["1", "2", "3", "4", "5", "6"])
      })
      await act(async () => {
        await result.current.submitMfa("654321")
      })

      expect(result.current.currentStepTitle).toBe("Your Substack Token")
    })
  })
})
