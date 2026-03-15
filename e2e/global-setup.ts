import type { FullConfig } from "@playwright/test"
import type { Server } from "http"
import express, { Request, Response } from "express"

const MOCK_SERVER_PORT = 3001

// Create mock server with request-scoped state (identified by x-test-id cookie)
function createMockServer() {
  const app = express()
  app.use(express.json())

  // Store state per test ID
  const testStates = new Map<
    string,
    {
      emailLoginShouldFail: boolean
      otpShouldFail: boolean
      mfaShouldFail: boolean
      mfaRequired: boolean
    }
  >()

  const getDefaultState = () => ({
    emailLoginShouldFail: false,
    otpShouldFail: false,
    mfaShouldFail: false,
    mfaRequired: true,
  })

  const getState = (testId: string) => {
    if (!testStates.has(testId)) {
      testStates.set(testId, getDefaultState())
    }
    return testStates.get(testId)!
  }

  // Get test ID from cookie or header
  const getTestId = (req: Request): string => {
    const cookies = req.headers.cookie || ""
    const testIdMatch = cookies.match(/x-test-id=([^;]+)/)
    if (testIdMatch) return testIdMatch[1]
    return (req.headers["x-test-id"] as string) || "default"
  }

  // Reset state for a specific test
  app.post("/api/v1/__reset", (req: Request, res: Response) => {
    const testId = req.headers["x-test-id"] as string
    if (testId) {
      testStates.set(testId, getDefaultState())
    }
    res.json({ success: true })
  })

  // Configure mock behavior for a specific test
  app.post("/api/v1/__config", (req: Request, res: Response) => {
    const testId = req.headers["x-test-id"] as string
    if (testId) {
      const currentState = getState(testId)
      testStates.set(testId, { ...currentState, ...req.body })
    }
    res.json({ success: true })
  })

  // Mock email-login endpoint
  app.post("/api/v1/email-login", (req: Request, res: Response) => {
    const testId = getTestId(req)
    const state = getState(testId)
    const { email } = req.body

    if (state.emailLoginShouldFail) {
      res.status(400).json({ error: "Email login failed", message: "Invalid email" })
      return
    }

    if (!email || !email.includes("@")) {
      res.status(400).json({ error: "Invalid email", message: "Please provide a valid email" })
      return
    }

    res.setHeader("set-cookie", ["substack.sid=mock-session-token-12345; Path=/; HttpOnly; Secure"])
    res.json({ success: true, requires_completion: true })
  })

  // Mock email-otp-login/complete endpoint
  app.post("/api/v1/email-otp-login/complete", (req: Request, res: Response) => {
    const testId = getTestId(req)
    const state = getState(testId)
    const { code } = req.body

    if (state.otpShouldFail) {
      res.status(400).json({ error: "Invalid code", message: "The verification code is incorrect" })
      return
    }

    if (!code || code.length !== 6) {
      res.status(400).json({ error: "Invalid code", message: "Code must be 6 digits" })
      return
    }

    res.setHeader("set-cookie", ["substack.sid=mock-otp-verified-token-67890; Path=/; HttpOnly; Secure"])
    res.json({ success: true, mfa_required: state.mfaRequired })
  })

  // Mock mfa-login endpoint
  app.post("/api/v1/mfa-login", (req: Request, res: Response) => {
    const testId = getTestId(req)
    const state = getState(testId)
    const { code } = req.body

    if (state.mfaShouldFail) {
      res.status(400).json({ error: "Invalid MFA code", message: "The MFA code is incorrect" })
      return
    }

    if (!code || code.length !== 6) {
      res.status(400).json({ error: "Invalid code", message: "MFA code must be 6 digits" })
      return
    }

    res.setHeader("set-cookie", ["substack.sid=mock-final-auth-token-abcdef123456; Path=/; HttpOnly; Secure"])
    res.json({ success: true, user: { id: 12345, email: "test@example.com" } })
  })

  // Health check
  app.get("/health", (req: Request, res: Response) => {
    res.json({ status: "ok" })
  })

  return app
}

async function globalSetup(_config: FullConfig) {
  console.log("Starting mock server...")

  // Start mock server
  const app = createMockServer()
  const mockServer = await new Promise<Server>((resolve) => {
    const server = app.listen(MOCK_SERVER_PORT, () => {
      console.log(`Mock Substack server started on http://localhost:${MOCK_SERVER_PORT}`)
      resolve(server)
    })
  })

  return async () => {
    await new Promise<void>((resolve, reject) => {
      mockServer.close((error) => {
        if (error) {
          reject(error)
          return
        }

        console.log("Mock Substack server stopped")
        resolve()
      })
    })
  }
}

export default globalSetup
