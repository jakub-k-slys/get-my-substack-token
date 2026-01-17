"use client"

import { useState } from "react"
import { Eye, EyeOff, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuthFlowContext } from "@/hooks"

export const TokenDisplayStep = () => {
  const { state, reset } = useAuthFlowContext()
  const [showToken, setShowToken] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopyToken = async () => {
    await navigator.clipboard.writeText(state.token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <p data-testid="token-message" className="text-sm text-muted-foreground text-center mb-6">
        Your authentication token has been generated successfully. Keep it secure!
      </p>

      <div className="space-y-4">
        <div className="relative">
          <Input
            type={showToken ? "text" : "password"}
            data-testid="token-input"
            value={state.token}
            readOnly
            className="bg-input border-border text-card-foreground h-12 pr-20 font-mono text-sm"
          />
          <button
            type="button"
            data-testid="toggle-visibility-button"
            onClick={() => setShowToken(!showToken)}
            className="absolute right-12 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-card-foreground transition-colors"
          >
            {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
          <button
            type="button"
            data-testid="copy-inline-button"
            onClick={handleCopyToken}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-card-foreground transition-colors"
          >
            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>

        <Button
          data-testid="copy-token-button"
          onClick={handleCopyToken}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base font-medium"
        >
          {copied ? "Copied!" : "Copy Token"}
        </Button>
      </div>

      <div className="mt-6 p-4 bg-accent/30 rounded-lg">
        <p className="text-xs text-muted-foreground text-center">
          Store this token securely. You won&apos;t be able to see it again.
        </p>
      </div>

      <Button data-testid="start-over-button" variant="ghost" onClick={reset} className="w-full text-muted-foreground">
        Start Over
      </Button>
    </div>
  )
}
