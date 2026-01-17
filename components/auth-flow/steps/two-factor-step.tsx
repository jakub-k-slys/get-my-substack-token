"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { twoFactorSchema, type TwoFactorFormData } from "@/lib/validators/auth-schemas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuthFlowContext } from "@/hooks"

export const TwoFactorStep = () => {
  const { state, submitMfa, skipMfa, isLoading, canSkipMfa } = useAuthFlowContext()

  const form = useForm<TwoFactorFormData>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: {
      code: "",
    },
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    await submitMfa(data.code)
  })

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-sm text-muted-foreground text-center mb-6">
        Enter the code from your authenticator app below.
      </p>

      {state.error && (
        <div data-testid="error-message" className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive text-center">{state.error}</p>
        </div>
      )}

      <div className="space-y-2">
        <Input
          type="text"
          data-testid="mfa-input"
          placeholder="Type your 6-digit code here..."
          {...form.register("code")}
          maxLength={6}
          className="bg-input border-border text-card-foreground placeholder:text-muted-foreground h-12"
          aria-invalid={!!form.formState.errors.code}
        />
        {form.formState.errors.code && (
          <p data-testid="mfa-error" className="text-sm text-destructive">
            {form.formState.errors.code.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        data-testid="confirm-button"
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base font-medium"
        disabled={isLoading}
      >
        {isLoading ? "Confirming..." : "Confirm"}
      </Button>

      {canSkipMfa && (
        <Button
          type="button"
          data-testid="skip-2fa-button"
          variant="ghost"
          onClick={skipMfa}
          className="w-full text-muted-foreground hover:text-card-foreground"
          disabled={isLoading}
        >
          Skip (no 2FA enabled)
        </Button>
      )}
    </form>
  )
}
