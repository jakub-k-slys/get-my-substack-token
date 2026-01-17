import { z } from "zod"

// Email step validation
export const emailSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(255, "Email is too long"),
})

export type EmailFormData = z.infer<typeof emailSchema>

// Verification code validation (array of 6 digits)
export const verificationCodeSchema = z.object({
  code: z
    .array(z.string().regex(/^\d$/, "Must be a digit"))
    .length(6, "Verification code must be 6 digits")
    .refine((arr) => arr.every((digit) => digit.length === 1), "Each digit must be a single character"),
})

export type VerificationCodeFormData = z.infer<typeof verificationCodeSchema>

// Two-factor authentication validation
export const twoFactorSchema = z.object({
  code: z
    .string()
    .regex(/^\d{6}$/, "Code must be 6 digits")
    .length(6, "Code must be exactly 6 digits"),
})

export type TwoFactorFormData = z.infer<typeof twoFactorSchema>

// Combined schema for full auth flow (useful for testing)
export const authFlowSchema = z.object({
  email: emailSchema.shape.email,
  verificationCode: verificationCodeSchema.shape.code,
  twoFactorCode: twoFactorSchema.shape.code.optional(),
})

export type AuthFlowFormData = z.infer<typeof authFlowSchema>
