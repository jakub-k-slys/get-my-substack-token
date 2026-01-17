import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { obfuscateEmail, obfuscateToken, logger } from "./logger"

describe("obfuscateEmail", () => {
  it("obfuscates standard email addresses", () => {
    expect(obfuscateEmail("user@example.com")).toBe("us***@example.com")
    expect(obfuscateEmail("john.doe@gmail.com")).toBe("jo***@gmail.com")
  })

  it("handles short local parts", () => {
    expect(obfuscateEmail("ab@example.com")).toBe("a***@example.com")
    expect(obfuscateEmail("a@example.com")).toBe("a***@example.com")
  })

  it("handles null and undefined", () => {
    expect(obfuscateEmail(null)).toBe("***")
    expect(obfuscateEmail(undefined)).toBe("***")
  })

  it("handles empty string", () => {
    expect(obfuscateEmail("")).toBe("***")
  })

  it("handles invalid email without @", () => {
    expect(obfuscateEmail("notanemail")).toBe("***")
  })

  it("preserves the domain", () => {
    expect(obfuscateEmail("test@subdomain.example.org")).toBe("te***@subdomain.example.org")
  })
})

describe("obfuscateToken", () => {
  it("obfuscates long tokens (> 12 chars)", () => {
    expect(obfuscateToken("abc123xyz789abcd")).toBe("abc1...abcd")
    expect(obfuscateToken("1234567890123456")).toBe("1234...3456")
  })

  it("obfuscates medium tokens (8-12 chars)", () => {
    expect(obfuscateToken("12345678")).toBe("1234...")
    expect(obfuscateToken("123456789012")).toBe("1234...")
  })

  it("fully masks short tokens (< 8 chars)", () => {
    expect(obfuscateToken("1234567")).toBe("***")
    expect(obfuscateToken("abc")).toBe("***")
    expect(obfuscateToken("a")).toBe("***")
  })

  it("handles null and undefined", () => {
    expect(obfuscateToken(null)).toBe("***")
    expect(obfuscateToken(undefined)).toBe("***")
  })

  it("handles empty string", () => {
    expect(obfuscateToken("")).toBe("***")
  })
})

describe("logger", () => {
  let consoleSpy: {
    log: ReturnType<typeof vi.spyOn>
    warn: ReturnType<typeof vi.spyOn>
    error: ReturnType<typeof vi.spyOn>
  }

  beforeEach(() => {
    consoleSpy = {
      log: vi.spyOn(console, "log").mockImplementation(() => {}),
      warn: vi.spyOn(console, "warn").mockImplementation(() => {}),
      error: vi.spyOn(console, "error").mockImplementation(() => {}),
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("logger.info logs with INFO level", () => {
    logger.info("Test message")
    expect(consoleSpy.log).toHaveBeenCalledTimes(1)
    expect(consoleSpy.log.mock.calls[0][0]).toMatch(/\[.*\] INFO\s+Test message/)
  })

  it("logger.warn logs with WARN level", () => {
    logger.warn("Warning message")
    expect(consoleSpy.warn).toHaveBeenCalledTimes(1)
    expect(consoleSpy.warn.mock.calls[0][0]).toMatch(/\[.*\] WARN\s+Warning message/)
  })

  it("logger.error logs with ERROR level", () => {
    logger.error("Error message")
    expect(consoleSpy.error).toHaveBeenCalledTimes(1)
    expect(consoleSpy.error.mock.calls[0][0]).toMatch(/\[.*\] ERROR Error message/)
  })

  it("includes context in log message", () => {
    logger.info("Test", { key: "value", num: 42 })
    expect(consoleSpy.log.mock.calls[0][0]).toMatch(/Test \| key="value" num=42/)
  })

  it("handles empty context", () => {
    logger.info("Test", {})
    expect(consoleSpy.log.mock.calls[0][0]).not.toContain("|")
  })

  describe("debug level", () => {
    const originalEnv = process.env.NODE_ENV

    afterEach(() => {
      process.env.NODE_ENV = originalEnv
    })

    it("logs in development", () => {
      process.env.NODE_ENV = "development"
      logger.debug("Debug message")
      expect(consoleSpy.log).toHaveBeenCalledTimes(1)
      expect(consoleSpy.log.mock.calls[0][0]).toMatch(/DEBUG Debug message/)
    })

    it("does not log in production", () => {
      process.env.NODE_ENV = "production"
      logger.debug("Debug message")
      expect(consoleSpy.log).not.toHaveBeenCalled()
    })
  })
})
