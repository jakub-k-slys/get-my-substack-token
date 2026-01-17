type LogLevel = "debug" | "info" | "warn" | "error"

type LogContext = Record<string, unknown>

/**
 * Obfuscates an email address for safe logging.
 * Shows first 2 characters + "***" + "@" + domain
 * @example obfuscateEmail("user@example.com") → "us***@example.com"
 */
export function obfuscateEmail(email: string | undefined | null): string {
  if (!email) return "***"

  const atIndex = email.indexOf("@")
  if (atIndex === -1) return "***"

  const localPart = email.slice(0, atIndex)
  const domain = email.slice(atIndex)

  if (localPart.length <= 2) {
    return localPart.charAt(0) + "***" + domain
  }

  return localPart.slice(0, 2) + "***" + domain
}

/**
 * Obfuscates a token for safe logging.
 * - Tokens > 12 chars: first 4 + "..." + last 4
 * - Tokens 8-12 chars: first 4 + "..."
 * - Tokens < 8 chars: fully masked as "***"
 * @example obfuscateToken("abc123xyz789abcd") → "abc1...abcd"
 */
export function obfuscateToken(token: string | undefined | null): string {
  if (!token) return "***"

  const length = token.length

  if (length < 8) {
    return "***"
  }

  if (length <= 12) {
    return token.slice(0, 4) + "..."
  }

  return token.slice(0, 4) + "..." + token.slice(-4)
}

function formatContext(context?: LogContext): string {
  if (!context || Object.keys(context).length === 0) return ""

  const formatted = Object.entries(context)
    .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
    .join(" ")

  return ` | ${formatted}`
}

function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString()
  const levelUpper = level.toUpperCase().padEnd(5)
  return `[${timestamp}] ${levelUpper} ${message}${formatContext(context)}`
}

export const logger = {
  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === "production") return
    console.log(formatMessage("debug", message, context))
  },

  info(message: string, context?: LogContext): void {
    console.log(formatMessage("info", message, context))
  },

  warn(message: string, context?: LogContext): void {
    console.warn(formatMessage("warn", message, context))
  },

  error(message: string, context?: LogContext): void {
    console.error(formatMessage("error", message, context))
  },
}
