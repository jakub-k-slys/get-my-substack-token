"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Bookmark, Mail, Eye, EyeOff, Copy, Check } from "lucide-react"
import { emailLogin, verifyEmailOtp, verifyMfa, getSessionToken } from "@/app/actions/substack-auth"

type Step = "email" | "verification" | "twoFactor" | "token"

export default function SubstackTokenFlow() {
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""])
  const [twoFactorCode, setTwoFactorCode] = useState("")
  const [showToken, setShowToken] = useState(false)
  const [copied, setCopied] = useState(false)
  const [sessionId, setSessionId] = useState("")
  const [token, setToken] = useState("")
  const [mfaToken, setMfaToken] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    try {
      await emailLogin(email)

      // Get the session ID that was set by the server action
      const sid = await getSessionToken()
      if (sid) {
        setSessionId(sid)
      }

      setStep("verification")
    } catch (error) {
      console.error("Email login error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = verificationCode.join("")
    if (code.length !== 6) return

    setIsLoading(true)
    setError("")
    try {
      const data = await verifyEmailOtp(code, email)

      // Log the response for debugging
      console.log("Verification response:", data)

      // Check for API errors
      if (data.error || data.errors) {
        const errorMessage = data.error || data.errors?.[0]?.message || "Verification failed"
        setError(errorMessage)
        console.error("API returned error:", errorMessage)
        return
      }

      // Store the session token if we got one
      if (data.sessionToken) {
        setToken(data.sessionToken)
        console.log("Session token received:", data.sessionToken)
      }

      // Check if response includes MFA requirement
      if (data.token) {
        setMfaToken(data.token)
      }

      // Check if we need 2FA based on redirect URL or explicit flags
      const needsMfa = data.requires_mfa || data.token || data.redirect?.includes("/mfa")

      if (needsMfa) {
        // MFA is required, move to 2FA step
        console.log("MFA required, moving to 2FA step")
        setStep("twoFactor")
      } else {
        // If no 2FA required and we have a token, show it
        if (data.sessionToken) {
          setStep("token")
        } else {
          setError("Failed to retrieve session token")
        }
      }
    } catch (error) {
      console.error("Verification error:", error)
      setError(error instanceof Error ? error.message : "An error occurred during verification")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTwoFactorSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!twoFactorCode) return

    setIsLoading(true)
    setError("")
    try {
      const data = await verifyMfa(twoFactorCode, mfaToken)

      console.log("MFA verification response:", data)

      // Check for API errors
      if (data.error || data.errors) {
        const errorMessage = data.error || data.errors?.[0]?.message || "MFA verification failed"
        setError(errorMessage)
        console.error("API returned error:", errorMessage)
        return
      }

      // Use the session token from the response
      if (data.sessionToken) {
        setToken(data.sessionToken)
        console.log("Session token received from MFA:", data.sessionToken)
        setStep("token")
      } else {
        setError("Failed to retrieve session token after MFA verification")
      }
    } catch (error) {
      console.error("MFA error:", error)
      setError(error instanceof Error ? error.message : "An error occurred during MFA verification")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkipTwoFactor = async () => {
    // If skipping 2FA, use the token we already have from verification
    if (token) {
      console.log("Using existing token from verification")
      setStep("token")
    } else {
      // Fallback: try to get session ID from the server
      const sid = await getSessionToken()
      if (sid) {
        setToken(sid)
        setStep("token")
      } else if (sessionId) {
        setToken(sessionId)
        setStep("token")
      } else {
        setError("No session token available. Please try the verification again.")
      }
    }
  }

  const handleVerificationCodeChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...verificationCode]
      newCode[index] = value
      setVerificationCode(newCode)

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`)
        nextInput?.focus()
      }
    }
  }

  const handleCopyToken = async () => {
    await navigator.clipboard.writeText(token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="w-full max-w-md bg-card text-card-foreground shadow-2xl">
      <div className="p-8">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary/10 p-3 rounded-lg mb-4">
            <Bookmark className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-center">
            {step === "email" && "Sign in to Substack"}
            {step === "verification" && "Check your email to continue"}
            {step === "twoFactor" && "Two-factor authentication"}
            {step === "token" && "Your Substack Token"}
          </h1>
        </div>

        {/* Step 1: Email */}
        {step === "email" && (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-input border-border text-card-foreground placeholder:text-muted-foreground h-12"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Continue"}
            </Button>
          </form>
        )}

        {/* Step 2: Verification Code */}
        {step === "verification" && (
          <form onSubmit={handleVerificationSubmit} className="space-y-6">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-accent/50 p-4 rounded-lg">
                <Mail className="w-8 h-8 text-card-foreground" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center mb-6">
              {"We've sent an email to"} <span className="text-card-foreground">{email}</span>. Click the magic link or
              enter the code below:
            </p>
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive text-center">{error}</p>
              </div>
            )}
            <div className="flex gap-2 justify-center">
              {verificationCode.map((digit, index) => (
                <Input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleVerificationCodeChange(index, e.target.value)}
                  className="w-12 h-14 text-center text-lg font-semibold bg-input border-border"
                />
              ))}
            </div>
            <div className="text-center">
              <button type="button" className="text-sm text-muted-foreground hover:text-card-foreground">
                {"Didn't get the email?"} <span className="text-primary">Try again</span>
              </button>
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Continue"}
            </Button>
          </form>
        )}

        {/* Step 3: Two-Factor Authentication */}
        {step === "twoFactor" && (
          <form onSubmit={handleTwoFactorSubmit} className="space-y-6">
            <p className="text-sm text-muted-foreground text-center mb-6">
              Enter the code from your authenticator app below.
            </p>
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive text-center">{error}</p>
              </div>
            )}
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Type your 6-digit code here..."
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                maxLength={6}
                className="bg-input border-border text-card-foreground placeholder:text-muted-foreground h-12"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Confirming..." : "Confirm"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleSkipTwoFactor}
              className="w-full text-muted-foreground hover:text-card-foreground"
              disabled={isLoading}
            >
              Skip (no 2FA enabled)
            </Button>
          </form>
        )}

        {/* Step 4: Token Display */}
        {step === "token" && (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground text-center mb-6">
              Your authentication token has been generated successfully. Keep it secure!
            </p>
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type={showToken ? "text" : "password"}
                  value={token}
                  readOnly
                  className="bg-input border-border text-card-foreground h-12 pr-20 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-12 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-card-foreground transition-colors"
                >
                  {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                <button
                  type="button"
                  onClick={handleCopyToken}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-card-foreground transition-colors"
                >
                  {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              <Button
                onClick={handleCopyToken}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base font-medium"
              >
                {copied ? "Copied!" : "Copy Token"}
              </Button>
            </div>
            <div className="mt-6 p-4 bg-accent/30 rounded-lg">
              <p className="text-xs text-muted-foreground text-center">
                Store this token securely. You {"won't"} be able to see it again.
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
