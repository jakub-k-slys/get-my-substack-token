"use server"

import axios from "axios"
import { cookies } from "next/headers"
import { logger, obfuscateEmail, obfuscateToken } from "@/lib/logger"

const getTestIdCookie = async (): Promise<string | undefined> => {
  const cookieStore = await cookies()
  return cookieStore.get("x-test-id")?.value
}

const buildCookieHeader = (testId: string | undefined, additionalCookies?: string): string => {
  const parts: string[] = []
  if (testId) parts.push(`x-test-id=${testId}`)
  if (additionalCookies) parts.push(additionalCookies)
  return parts.join("; ")
}

const createApi = async () => {
  const testId = await getTestIdCookie()

  return {
    instance: axios.create({
      baseURL: process.env.SUBSTACK_API_URL || "https://substack.com/api/v1/",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "en-US,en;q=0.9",
        Connection: "keep-alive",
        Origin: "https://substack.com",
        Referer: "https://substack.com/sign-in",
      },
    }),
    testId,
  }
}

// Utility function to extract token from response headers
const extractTokenFromHeaders = (headers: { "set-cookie"?: string[] }): string | undefined => {
  const setCookieHeaders = headers["set-cookie"]
  if (!setCookieHeaders) return undefined

  const substackSid = setCookieHeaders.find((cookie) => cookie.includes("substack.sid"))

  if (!substackSid) return undefined

  // Use slice(1).join("=") instead of [1] to preserve "=" characters that
  // appear inside base64-encoded cookie values.
  return substackSid.split(";")[0].split("=").slice(1).join("=")
}

export const emailLogin = async (email: string): Promise<{ token: string | undefined }> => {
  logger.info("Email OTP initiated", { email: obfuscateEmail(email) })
  try {
    const { instance: api, testId } = await createApi()
    const body = {
      email: email,
      redirect: "/home",
      can_create_user: true,
    }
    const cookieHeader = buildCookieHeader(testId)
    const response = await api.post("/email-login", body, {
      headers: cookieHeader ? { Cookie: cookieHeader } : {},
    })

    const token = extractTokenFromHeaders(response.headers)
    logger.info("Email login response", {
      status: response.status,
      hasCookie: token !== undefined,
    })

    return { token }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error("Email login failed", {
        status: error.response?.status,
        message: error.response?.data?.message,
      })
      throw new Error(error.response?.data?.message || "Email login failed")
    }
    throw error
  }
}

export const verifyEmailOtp = async (code: string, email: string, token: string | undefined) => {
  logger.info("Email OTP verification step", {
    email: obfuscateEmail(email),
    token: obfuscateToken(token),
  })
  try {
    const { instance: api, testId } = await createApi()
    const cookieHeader = buildCookieHeader(testId, token ? `substack.sid=${token}` : undefined)
    const response = await api.post(
      "/email-otp-login/complete",
      {
        code: code,
        email: email,
        redirect: "https://substack.com/home",
      },
      {
        headers: cookieHeader ? { Cookie: cookieHeader } : {},
      }
    )

    const newToken = extractTokenFromHeaders(response.headers)
    logger.info("OTP verification response", {
      status: response.status,
      hasCookie: newToken !== undefined,
    })

    return { newToken }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error("OTP verification failed", {
        status: error.response?.status,
        message: error.response?.data?.message,
      })
      throw new Error(error.response?.data?.message || "OTP verification failed")
    }
    throw error
  }
}

export const verifyMfa = async (
  code: string,
  token: string
): Promise<{ success: boolean; token?: string; error?: string }> => {
  logger.info("MFA verification step", { token: obfuscateToken(token) })
  try {
    const { instance: api, testId } = await createApi()
    const cookieHeader = buildCookieHeader(testId, token ? `substack.sid=${token}` : undefined)
    const response = await api.post(
      "/mfa-login",
      {
        code: code,
        token: "",
        redirect: "",
      },
      {
        headers: cookieHeader ? { Cookie: cookieHeader } : {},
      }
    )

    logger.info("MFA verification response", { status: response.status })

    // Check for API errors
    if (response.data.error || response.data.errors) {
      const errorMessage = response.data.error || response.data.errors?.[0]?.message || "MFA verification failed"
      logger.warn("MFA verification returned error", { error: errorMessage })
      return { success: false, error: errorMessage }
    }

    // Extract new token if available
    const newToken = extractTokenFromHeaders(response.headers)
    if (newToken) {
      logger.debug("Token obtained after MFA verification", { token: obfuscateToken(newToken) })
    }

    return {
      success: true,
      token: newToken || token,
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error("MFA verification failed", {
        status: error.response?.status,
        message: error.response?.data?.message,
      })
      return {
        success: false,
        error: error.response?.data?.message || "MFA verification failed",
      }
    }
    logger.error("MFA verification unexpected error", { error: String(error) })
    return { success: false, error: "An unexpected error occurred" }
  }
}
