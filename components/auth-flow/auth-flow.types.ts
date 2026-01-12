// State types
export type AuthFlowState = "email" | "verification" | "twoFactor" | "token"
export type AuthFlowStatus = "idle" | "loading" | "success" | "error"

// State context
export interface AuthFlowContext {
  // Current state
  currentStep: AuthFlowState
  status: AuthFlowStatus

  // Form data accumulated across steps
  email: string
  verificationCode: string[]
  twoFactorCode: string
  token: string

  // Metadata
  mfaRequired: boolean
  allowSkip: boolean
  error: string | null

  // History for debugging/analytics
  history: Array<{
    step: AuthFlowState
    timestamp: number
    action: string
  }>
}

// Action types
export type AuthFlowAction =
  // Email step actions
  | { type: "EMAIL_SUBMIT_START"; payload: { email: string } }
  | { type: "EMAIL_SUBMIT_SUCCESS"; payload: { token: string } }
  | { type: "EMAIL_SUBMIT_ERROR"; payload: { error: string } }

  // Verification step actions
  | { type: "OTP_UPDATE"; payload: { code: string[] } }
  | { type: "OTP_SUBMIT_START" }
  | { type: "OTP_VERIFY_SUCCESS_MFA_REQUIRED"; payload: { token?: string } }
  | { type: "OTP_VERIFY_SUCCESS_NO_MFA"; payload: { token: string } }
  | { type: "OTP_VERIFY_ERROR"; payload: { error: string } }

  // Two-factor step actions
  | { type: "MFA_UPDATE"; payload: { code: string } }
  | { type: "MFA_SUBMIT_START" }
  | { type: "MFA_VERIFY_SUCCESS"; payload: { token: string } }
  | { type: "MFA_VERIFY_ERROR"; payload: { error: string } }
  | { type: "MFA_SKIP" }

  // Token display actions
  | { type: "TOKEN_COPY" }
  | { type: "TOKEN_SHOW_TOGGLE" }

  // Global actions
  | { type: "RESET" }
  | { type: "RETRY" }

// Step component prop interfaces
export interface BaseStepProps {
  isLoading: boolean
  error: string | null
  onError?: (error: string) => void
}

export interface EmailStepProps extends BaseStepProps {
  initialEmail?: string
  onSubmit: (email: string) => Promise<void>
}

export interface VerificationStepProps extends BaseStepProps {
  email: string
  initialCode?: string[]
  onSubmit: (code: string[]) => Promise<void>
  onResend?: () => Promise<void>
}

export interface TwoFactorStepProps extends BaseStepProps {
  canSkip: boolean
  onSubmit: (code: string) => Promise<void>
  onSkip: () => void
}

export interface TokenDisplayStepProps {
  token: string
  onReset?: () => void
}

// State transition validation
export interface StateTransition {
  from: AuthFlowState
  to: AuthFlowState
  action: string
  guard?: (context: AuthFlowContext) => boolean
}
