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

/**
 * Obfuscates action parameters for safe logging.
 * Applies appropriate obfuscation based on parameter names.
 */
export function obfuscateParams(params: Record<string, unknown>): Record<string, unknown> {
  const obfuscated: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) {
      obfuscated[key] = "***"
      continue
    }

    // Obfuscate known sensitive fields
    if (key === "email" && typeof value === "string") {
      obfuscated[key] = obfuscateEmail(value)
    } else if (key === "token" && typeof value === "string") {
      obfuscated[key] = obfuscateToken(value)
    } else if (key === "code" && typeof value === "string") {
      // OTP/MFA codes - show length only
      obfuscated[key] = `[${value.length} digits]`
    } else if (key === "code" && Array.isArray(value)) {
      // Verification code array - show length only
      const filled = value.filter((v) => v !== "").length
      obfuscated[key] = `[${filled}/${value.length} digits filled]`
    } else if (key === "error" && typeof value === "string") {
      // Errors are safe to log
      obfuscated[key] = value
    } else if (typeof value === "object" && value !== null) {
      // Recursively obfuscate nested objects
      obfuscated[key] = obfuscateParams(value as Record<string, unknown>)
    } else {
      obfuscated[key] = value
    }
  }

  return obfuscated
}

export interface StateChangeLogEntry {
  action: string
  previousStep: string | null
  currentStep: string
  params: Record<string, unknown>
}

export interface StateChangeLogOptions {
  entry: StateChangeLogEntry
  history: StateChangeLogEntry[]
}

/**
 * Logs a state change with its parameters and the full history.
 */
export function logStateChange(options: StateChangeLogOptions): void {
  const { entry, history } = options
  const obfuscatedParams = obfuscateParams(entry.params)

  const transition = entry.previousStep
    ? `${entry.previousStep} → ${entry.currentStep}`
    : `initial → ${entry.currentStep}`

  logger.info(`State change: ${entry.action}`, {
    transition,
    params: obfuscatedParams,
  })

  // Log history summary
  if (history.length > 0) {
    const historyLog = history.map((h, index) => {
      const histTransition = h.previousStep
        ? `${h.previousStep} → ${h.currentStep}`
        : `initial → ${h.currentStep}`
      return `  [${index + 1}] ${h.action}: ${histTransition}`
    })

    logger.debug("State change history", {
      totalChanges: history.length,
      history: historyLog,
    })
  }
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
