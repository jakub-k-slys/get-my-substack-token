"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { emailSchema, type EmailFormData } from "@/lib/validators/auth-schemas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuthFlowContext } from "@/hooks"

export const EmailStep = () => {
  const { state, submitEmail, isLoading } = useAuthFlowContext()

  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: state.email || "",
    },
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    await submitEmail(data.email)
  })

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Input
          id="email"
          data-testid="email-input"
          type="email"
          placeholder="Your email"
          {...form.register("email")}
          className="bg-input border-border text-card-foreground placeholder:text-muted-foreground h-12"
          aria-invalid={!!form.formState.errors.email}
        />
        {form.formState.errors.email && (
          <p data-testid="email-error" className="text-sm text-destructive">{form.formState.errors.email.message}</p>
        )}
      </div>

      {state.error && (
        <div data-testid="error-message" className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive text-center">{state.error}</p>
        </div>
      )}

      <Button
        type="submit"
        data-testid="continue-button"
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base font-medium"
        disabled={isLoading}
      >
        {isLoading ? "Sending..." : "Continue"}
      </Button>
    </form>
  )
}
