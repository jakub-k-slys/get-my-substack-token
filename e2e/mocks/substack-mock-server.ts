import express, { Request, Response } from "express"

const app = express()
app.use(express.json())

// Store state for testing scenarios
let mockState = {
  emailLoginShouldFail: false,
  otpShouldFail: false,
  mfaShouldFail: false,
  mfaRequired: true,
}

// Reset state endpoint (for tests to configure scenarios)
app.post("/api/v1/__reset", (req: Request, res: Response) => {
  mockState = {
    emailLoginShouldFail: false,
    otpShouldFail: false,
    mfaShouldFail: false,
    mfaRequired: true,
  }
  res.json({ success: true })
})

// Configure mock behavior
app.post("/api/v1/__config", (req: Request, res: Response) => {
  mockState = { ...mockState, ...req.body }
  res.json({ success: true, state: mockState })
})

// Mock email-login endpoint
app.post("/api/v1/email-login", (req: Request, res: Response) => {
  const { email } = req.body

  if (mockState.emailLoginShouldFail) {
    res.status(400).json({ error: "Email login failed", message: "Invalid email" })
    return
  }

  if (!email || !email.includes("@")) {
    res.status(400).json({ error: "Invalid email", message: "Please provide a valid email" })
    return
  }

  // Set mock token in cookie
  res.setHeader("set-cookie", [
    "substack.sid=mock-session-token-12345; Path=/; HttpOnly; Secure",
  ])

  res.json({
    success: true,
    requires_completion: true,
  })
})

// Mock email-otp-login/complete endpoint
app.post("/api/v1/email-otp-login/complete", (req: Request, res: Response) => {
  const { code, email } = req.body

  if (mockState.otpShouldFail) {
    res.status(400).json({ error: "Invalid code", message: "The verification code is incorrect" })
    return
  }

  if (!code || code.length !== 6) {
    res.status(400).json({ error: "Invalid code", message: "Code must be 6 digits" })
    return
  }

  // Set new token after OTP verification
  res.setHeader("set-cookie", [
    "substack.sid=mock-otp-verified-token-67890; Path=/; HttpOnly; Secure",
  ])

  res.json({
    success: true,
    mfa_required: mockState.mfaRequired,
  })
})

// Mock mfa-login endpoint
app.post("/api/v1/mfa-login", (req: Request, res: Response) => {
  const { code } = req.body

  if (mockState.mfaShouldFail) {
    res.status(400).json({ error: "Invalid MFA code", message: "The MFA code is incorrect" })
    return
  }

  if (!code || code.length !== 6) {
    res.status(400).json({ error: "Invalid code", message: "MFA code must be 6 digits" })
    return
  }

  // Set final token after MFA
  res.setHeader("set-cookie", [
    "substack.sid=mock-final-auth-token-abcdef123456; Path=/; HttpOnly; Secure",
  ])

  res.json({
    success: true,
    user: {
      id: 12345,
      email: "test@example.com",
    },
  })
})

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok" })
})

export { app }

// Only start server if run directly (not imported)
if (require.main === module) {
  const PORT = process.env.MOCK_SERVER_PORT || 3001
  const server = app.listen(PORT, () => {
    console.log(`Substack mock server running on http://localhost:${PORT}`)
  })

  process.on("SIGTERM", () => {
    server.close(() => process.exit(0))
  })

  process.on("SIGINT", () => {
    server.close(() => process.exit(0))
  })
}
