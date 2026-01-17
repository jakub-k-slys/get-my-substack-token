import { useReducer, useCallback } from "react"
import type {
  AuthFlowContext,
  AuthFlowAction,
  AuthFlowState,
  StateTransition,
} from "@/components/auth-flow/auth-flow.types"
import { emailLogin, verifyEmailOtp, verifyMfa } from "@/app/actions/substack-auth"

// Initial state
const initialState: AuthFlowContext = {
  currentStep: "email",
  status: "idle",
  email: "",
  verificationCode: ["", "", "", "", "", ""],
  twoFactorCode: "",
  token: "",
  mfaRequired: false,
  allowSkip: true, // Allow skipping 2FA by default
  error: null,
  history: [],
}

// Valid state transitions
const transitions: StateTransition[] = [
  { from: "email", to: "verification", action: "EMAIL_SUBMIT_SUCCESS" },
  { from: "verification", to: "twoFactor", action: "OTP_VERIFY_SUCCESS_MFA_REQUIRED" },
  { from: "verification", to: "token", action: "OTP_VERIFY_SUCCESS_NO_MFA" },
  { from: "twoFactor", to: "token", action: "MFA_VERIFY_SUCCESS" },
  { from: "twoFactor", to: "token", action: "MFA_SKIP" },
]

// Validate state transition
const validateTransition = (currentStep: AuthFlowState, action: AuthFlowAction, context: AuthFlowContext): boolean => {
  // Global actions are always allowed
  if (action.type === "RESET" || action.type === "RETRY") return true

  // Non-transition actions are always allowed
  if (
    action.type === "OTP_UPDATE" ||
    action.type === "MFA_UPDATE" ||
    action.type === "TOKEN_COPY" ||
    action.type === "TOKEN_SHOW_TOGGLE"
  ) {
    return true
  }

  // Start actions are always allowed
  if (
    action.type === "EMAIL_SUBMIT_START" ||
    action.type === "OTP_SUBMIT_START" ||
    action.type === "MFA_SUBMIT_START"
  ) {
    return true
  }

  // Error actions are always allowed
  if (
    action.type === "EMAIL_SUBMIT_ERROR" ||
    action.type === "OTP_VERIFY_ERROR" ||
    action.type === "MFA_VERIFY_ERROR"
  ) {
    return true
  }

  // Find matching transition
  const transition = transitions.find((t) => t.from === currentStep && t.action === action.type)

  if (!transition) return false

  // Check guard condition if exists
  if (transition.guard && !transition.guard(context)) return false

  return true
}

// Reducer function
const authFlowReducer = (state: AuthFlowContext, action: AuthFlowAction): AuthFlowContext => {
  // Validate transition
  if (!validateTransition(state.currentStep, action, state)) {
    console.warn(`Invalid transition from ${state.currentStep} with action ${action.type}`)
    return state
  }

  switch (action.type) {
    case "EMAIL_SUBMIT_START":
      return {
        ...state,
        email: action.payload.email,
        status: "loading",
        error: null,
      }

    case "EMAIL_SUBMIT_SUCCESS":
      return {
        ...state,
        token: action.payload.token,
        currentStep: "verification",
        status: "success",
        history: [
          ...state.history,
          {
            step: "verification",
            timestamp: Date.now(),
            action: action.type,
          },
        ],
      }

    case "EMAIL_SUBMIT_ERROR":
      return {
        ...state,
        status: "error",
        error: action.payload.error,
      }

    case "OTP_UPDATE":
      return {
        ...state,
        verificationCode: action.payload.code,
      }

    case "OTP_SUBMIT_START":
      return {
        ...state,
        status: "loading",
        error: null,
      }

    case "OTP_VERIFY_SUCCESS_MFA_REQUIRED":
      return {
        ...state,
        token: action.payload.token || state.token,
        currentStep: "twoFactor",
        status: "success",
        mfaRequired: true,
        history: [
          ...state.history,
          {
            step: "twoFactor",
            timestamp: Date.now(),
            action: action.type,
          },
        ],
      }

    case "OTP_VERIFY_SUCCESS_NO_MFA":
      return {
        ...state,
        token: action.payload.token,
        currentStep: "token",
        status: "success",
        mfaRequired: false,
        history: [
          ...state.history,
          {
            step: "token",
            timestamp: Date.now(),
            action: action.type,
          },
        ],
      }

    case "OTP_VERIFY_ERROR":
      return {
        ...state,
        status: "error",
        error: action.payload.error,
      }

    case "MFA_UPDATE":
      return {
        ...state,
        twoFactorCode: action.payload.code,
      }

    case "MFA_SUBMIT_START":
      return {
        ...state,
        status: "loading",
        error: null,
      }

    case "MFA_VERIFY_SUCCESS":
      return {
        ...state,
        token: action.payload.token,
        currentStep: "token",
        status: "success",
        history: [
          ...state.history,
          {
            step: "token",
            timestamp: Date.now(),
            action: action.type,
          },
        ],
      }

    case "MFA_VERIFY_ERROR":
      return {
        ...state,
        status: "error",
        error: action.payload.error,
      }

    case "MFA_SKIP":
      return {
        ...state,
        currentStep: "token",
        status: "success",
        twoFactorCode: "",
        history: [
          ...state.history,
          {
            step: "token",
            timestamp: Date.now(),
            action: action.type,
          },
        ],
      }

    case "TOKEN_COPY":
      // Non-state-changing action, just for tracking
      return state

    case "TOKEN_SHOW_TOGGLE":
      // Non-state-changing action, handled by local component state
      return state

    case "RESET":
      return initialState

    case "RETRY":
      return {
        ...state,
        status: "idle",
        error: null,
      }

    default:
      return state
  }
}

// Step title mapping
const getStepTitle = (step: AuthFlowState): string => {
  const titles = {
    email: "Sign in to Substack",
    verification: "Check your email to continue",
    twoFactor: "Two-factor authentication",
    token: "Your Substack Token",
  }
  return titles[step]
}

// Hook interface
export interface UseAuthFlowReturn {
  // State
  state: AuthFlowContext

  // Step-specific handlers
  submitEmail: (email: string) => Promise<void>
  submitOtp: (code: string[]) => Promise<void>
  submitMfa: (code: string) => Promise<void>
  skipMfa: () => void

  // Utility handlers
  reset: () => void
  retry: () => void

  // Derived state
  isLoading: boolean
  canSkipMfa: boolean
  currentStepTitle: string
}

// Main hook
export const useAuthFlow = (): UseAuthFlowReturn => {
  const [state, dispatch] = useReducer(authFlowReducer, initialState)

  const submitEmail = useCallback(async (email: string) => {
    dispatch({ type: "EMAIL_SUBMIT_START", payload: { email } })
    try {
      const result = await emailLogin(email)
      if (!result.token) {
        throw new Error("No token received from email login")
      }
      dispatch({ type: "EMAIL_SUBMIT_SUCCESS", payload: { token: result.token } })
    } catch (error) {
      dispatch({
        type: "EMAIL_SUBMIT_ERROR",
        payload: { error: error instanceof Error ? error.message : "Email login failed" },
      })
    }
  }, [])

  const submitOtp = useCallback(
    async (code: string[]) => {
      dispatch({ type: "OTP_SUBMIT_START" })
      try {
        const codeString = code.join("")
        const result = await verifyEmailOtp(codeString, state.email, state.token)

        // For now, always assume MFA is required since the API always redirects to 2FA
        // In the future, check API response to determine if MFA is required
        dispatch({
          type: "OTP_VERIFY_SUCCESS_MFA_REQUIRED",
          payload: { token: result.newToken },
        })
      } catch (error) {
        dispatch({
          type: "OTP_VERIFY_ERROR",
          payload: { error: error instanceof Error ? error.message : "OTP verification failed" },
        })
      }
    },
    [state.email, state.token]
  )

  const submitMfa = useCallback(
    async (code: string) => {
      dispatch({ type: "MFA_SUBMIT_START" })
      try {
        const result = await verifyMfa(code, state.token)

        if (!result.success) {
          dispatch({
            type: "MFA_VERIFY_ERROR",
            payload: { error: result.error || "MFA verification failed" },
          })
          return
        }

        dispatch({
          type: "MFA_VERIFY_SUCCESS",
          payload: { token: result.token || state.token },
        })
      } catch (error) {
        dispatch({
          type: "MFA_VERIFY_ERROR",
          payload: { error: error instanceof Error ? error.message : "MFA verification failed" },
        })
      }
    },
    [state.token]
  )

  const skipMfa = useCallback(() => {
    dispatch({ type: "MFA_SKIP" })
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: "RESET" })
  }, [])

  const retry = useCallback(() => {
    dispatch({ type: "RETRY" })
  }, [])

  return {
    state,
    submitEmail,
    submitOtp,
    submitMfa,
    skipMfa,
    reset,
    retry,
    isLoading: state.status === "loading",
    canSkipMfa: state.allowSkip && state.currentStep === "twoFactor",
    currentStepTitle: getStepTitle(state.currentStep),
  }
}
