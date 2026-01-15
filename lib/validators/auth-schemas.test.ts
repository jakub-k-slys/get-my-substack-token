import { describe, it, expect } from "vitest"
import {
  emailSchema,
  verificationCodeSchema,
  twoFactorSchema,
  authFlowSchema,
} from "./auth-schemas"

describe("emailSchema", () => {
  it("should accept a valid email", () => {
    const result = emailSchema.safeParse({ email: "test@example.com" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.email).toBe("test@example.com")
    }
  })

  it("should accept email with subdomain", () => {
    const result = emailSchema.safeParse({ email: "user@mail.example.co.uk" })
    expect(result.success).toBe(true)
  })

  it("should accept email with plus addressing", () => {
    const result = emailSchema.safeParse({ email: "user+tag@example.com" })
    expect(result.success).toBe(true)
  })

  it("should reject empty email", () => {
    const result = emailSchema.safeParse({ email: "" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Email is required")
    }
  })

  it("should reject invalid email format", () => {
    const result = emailSchema.safeParse({ email: "not-an-email" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Please enter a valid email address")
    }
  })

  it("should reject email without domain", () => {
    const result = emailSchema.safeParse({ email: "user@" })
    expect(result.success).toBe(false)
  })

  it("should reject email without @", () => {
    const result = emailSchema.safeParse({ email: "userexample.com" })
    expect(result.success).toBe(false)
  })

  it("should reject email exceeding max length", () => {
    const longEmail = "a".repeat(250) + "@test.com"
    const result = emailSchema.safeParse({ email: longEmail })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Email is too long")
    }
  })

  it("should accept email at max length boundary", () => {
    // email has 255 char limit, @test.com is 9 chars
    const localPart = "a".repeat(246)
    const email = `${localPart}@test.com`
    expect(email.length).toBe(255)
    const result = emailSchema.safeParse({ email })
    expect(result.success).toBe(true)
  })
})

describe("verificationCodeSchema", () => {
  it("should accept valid 6-digit code array", () => {
    const result = verificationCodeSchema.safeParse({
      code: ["1", "2", "3", "4", "5", "6"],
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.code).toEqual(["1", "2", "3", "4", "5", "6"])
    }
  })

  it("should accept code with all zeros", () => {
    const result = verificationCodeSchema.safeParse({
      code: ["0", "0", "0", "0", "0", "0"],
    })
    expect(result.success).toBe(true)
  })

  it("should accept code with all nines", () => {
    const result = verificationCodeSchema.safeParse({
      code: ["9", "9", "9", "9", "9", "9"],
    })
    expect(result.success).toBe(true)
  })

  it("should reject code with less than 6 digits", () => {
    const result = verificationCodeSchema.safeParse({
      code: ["1", "2", "3", "4", "5"],
    })
    expect(result.success).toBe(false)
  })

  it("should reject code with more than 6 digits", () => {
    const result = verificationCodeSchema.safeParse({
      code: ["1", "2", "3", "4", "5", "6", "7"],
    })
    expect(result.success).toBe(false)
  })

  it("should reject code with non-digit characters", () => {
    const result = verificationCodeSchema.safeParse({
      code: ["1", "2", "a", "4", "5", "6"],
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Must be a digit")
    }
  })

  it("should reject code with special characters", () => {
    const result = verificationCodeSchema.safeParse({
      code: ["1", "2", "!", "4", "5", "6"],
    })
    expect(result.success).toBe(false)
  })

  it("should reject code with multi-digit strings", () => {
    const result = verificationCodeSchema.safeParse({
      code: ["12", "3", "4", "5", "6", "7"],
    })
    expect(result.success).toBe(false)
  })

  it("should reject code with empty strings", () => {
    const result = verificationCodeSchema.safeParse({
      code: ["1", "2", "", "4", "5", "6"],
    })
    expect(result.success).toBe(false)
  })

  it("should reject empty array", () => {
    const result = verificationCodeSchema.safeParse({ code: [] })
    expect(result.success).toBe(false)
  })
})

describe("twoFactorSchema", () => {
  it("should accept valid 6-digit code", () => {
    const result = twoFactorSchema.safeParse({ code: "123456" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.code).toBe("123456")
    }
  })

  it("should accept code with all zeros", () => {
    const result = twoFactorSchema.safeParse({ code: "000000" })
    expect(result.success).toBe(true)
  })

  it("should accept code with all nines", () => {
    const result = twoFactorSchema.safeParse({ code: "999999" })
    expect(result.success).toBe(true)
  })

  it("should reject code with less than 6 digits", () => {
    const result = twoFactorSchema.safeParse({ code: "12345" })
    expect(result.success).toBe(false)
  })

  it("should reject code with more than 6 digits", () => {
    const result = twoFactorSchema.safeParse({ code: "1234567" })
    expect(result.success).toBe(false)
  })

  it("should reject code with letters", () => {
    const result = twoFactorSchema.safeParse({ code: "12345a" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Code must be 6 digits")
    }
  })

  it("should reject code with special characters", () => {
    const result = twoFactorSchema.safeParse({ code: "12345!" })
    expect(result.success).toBe(false)
  })

  it("should reject code with spaces", () => {
    const result = twoFactorSchema.safeParse({ code: "123 56" })
    expect(result.success).toBe(false)
  })

  it("should reject empty string", () => {
    const result = twoFactorSchema.safeParse({ code: "" })
    expect(result.success).toBe(false)
  })
})

describe("authFlowSchema", () => {
  it("should accept valid complete auth flow data", () => {
    const result = authFlowSchema.safeParse({
      email: "test@example.com",
      verificationCode: ["1", "2", "3", "4", "5", "6"],
      twoFactorCode: "123456",
    })
    expect(result.success).toBe(true)
  })

  it("should accept auth flow data without optional twoFactorCode", () => {
    const result = authFlowSchema.safeParse({
      email: "test@example.com",
      verificationCode: ["1", "2", "3", "4", "5", "6"],
    })
    expect(result.success).toBe(true)
  })

  it("should reject invalid email in combined schema", () => {
    const result = authFlowSchema.safeParse({
      email: "invalid-email",
      verificationCode: ["1", "2", "3", "4", "5", "6"],
    })
    expect(result.success).toBe(false)
  })

  it("should reject invalid verification code in combined schema", () => {
    const result = authFlowSchema.safeParse({
      email: "test@example.com",
      verificationCode: ["1", "2", "3"],
    })
    expect(result.success).toBe(false)
  })

  it("should reject invalid two-factor code in combined schema", () => {
    const result = authFlowSchema.safeParse({
      email: "test@example.com",
      verificationCode: ["1", "2", "3", "4", "5", "6"],
      twoFactorCode: "invalid",
    })
    expect(result.success).toBe(false)
  })
})
