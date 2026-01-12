"use client"

import { Card } from "@/components/ui/card"
import { Bookmark } from "lucide-react"
import { AuthFlowProvider, useAuthFlowContext } from "@/hooks"
import { EmailStep, VerificationStep, TwoFactorStep, TokenDisplayStep } from "./steps"
import type { AuthFlowState } from "./auth-flow.types"

const AuthFlowContent = () => {
  const { state, currentStepTitle } = useAuthFlowContext()

  // Component map pattern - cleaner than multiple if statements
  const stepComponents: Record<AuthFlowState, React.ReactNode> = {
    email: <EmailStep />,
    verification: <VerificationStep />,
    twoFactor: <TwoFactorStep />,
    token: <TokenDisplayStep />,
  }

  return (
    <Card className="w-full max-w-md bg-card text-card-foreground shadow-2xl">
      <div className="p-8">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary/10 p-3 rounded-lg mb-4">
            <Bookmark className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-center">{currentStepTitle}</h1>
        </div>

        {/* Render current step */}
        {stepComponents[state.currentStep]}
      </div>
    </Card>
  )
}

export const AuthFlow = () => {
  return (
    <AuthFlowProvider>
      <AuthFlowContent />
    </AuthFlowProvider>
  )
}

export default AuthFlow
