"use client"

import { useState } from "react"
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuthFlowContext } from "@/hooks"

export const VerificationStep = () => {
  const { state, submitOtp, isLoading } = useAuthFlowContext()
  const [code, setCode] = useState<string[]>(state.verificationCode || ["", "", "", "", "", ""])

  const handleCodeChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...code]
      newCode[index] = value
      setCode(newCode)

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`)
        nextInput?.focus()
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const codeString = code.join("")
    if (codeString.length === 6) {
      await submitOtp(code)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-center mb-6">
        <div className="bg-accent/50 p-4 rounded-lg">
          <Mail className="w-8 h-8 text-card-foreground" />
        </div>
      </div>

      <p className="text-sm text-muted-foreground text-center mb-6">
        We&apos;ve sent an email to{" "}
        <span data-testid="email-display" className="text-card-foreground">
          {state.email}
        </span>
        . Click the magic link or enter the code below:
      </p>

      {state.error && (
        <div data-testid="error-message" className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive text-center">{state.error}</p>
        </div>
      )}

      <div data-testid="verification-code-inputs" className="flex gap-2 justify-center">
        {code.map((digit, index) => (
          <Input
            key={index}
            id={`code-${index}`}
            data-testid={`code-input-${index}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleCodeChange(index, e.target.value)}
            className="w-12 h-14 text-center text-lg font-semibold bg-input border-border"
          />
        ))}
      </div>

      <div className="text-center">
        <button type="button" className="text-sm text-muted-foreground hover:text-card-foreground">
          Didn&apos;t get the email? <span className="text-primary">Try again</span>
        </button>
      </div>

      <Button
        type="submit"
        data-testid="continue-button"
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base font-medium"
        disabled={isLoading || code.join("").length !== 6}
      >
        {isLoading ? "Verifying..." : "Continue"}
      </Button>
    </form>
  )
}
