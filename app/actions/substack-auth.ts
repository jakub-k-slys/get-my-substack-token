"use server"

import axios from "axios"

const api = axios.create({
  baseURL: 'https://substack.com/api/v1/',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'User-Agent': 'PostmanRuntime/7.51.0',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive'
  }
})

// Utility function to extract token from response headers
const extractTokenFromHeaders = (headers: Record<string, any>): string | undefined => {
  const setCookieHeaders = headers['set-cookie']
  if (!setCookieHeaders) return undefined

  const substackSid = setCookieHeaders.find((cookie: string) =>
    cookie.includes("substack.sid")
  )

  if (!substackSid) return undefined

  return substackSid.split(';')[0].split('=')[1]
}

export const emailLogin = async (email: string): Promise<{ token: string | undefined }> => {
  console.log(`email OTP initiated | Using email ${email}`)
  try {
    const body =  {
      email: email,
      redirect: '/home',
      can_create_user: true,
    }
    const response = await api.post('/email-login', body)
    if (response.data) {
      console.log(response.data)
    }

    const token = extractTokenFromHeaders(response.headers)
    if (token) {
      console.log(`email OTP initiated | New token obtained: ${token}`)
    }

    return { token }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Email login failed:", error.response?.status, error.response?.data)
      throw new Error(error.response?.data?.message || "Email login failed")
    }
    throw error
  }
}

export const verifyEmailOtp = async (code: string, email: string, token: string | undefined) => {
  console.log(`email OTP verification step | Using code ${code}, email ${email} and token ${token}`)
  try {
    const response = await api.post("/email-otp-login/complete", {
      code: code,
      email: email,
      redirect: "https://substack.com/home",
    }, {
      headers: {
        ...(token && { Cookie: `substack.sid=${token}` }),
      },
    })

    console.log("OTP verification response status:", response.status)
    console.log("OTP verification response data:", JSON.stringify(response.data, null, 2))

    const newToken = extractTokenFromHeaders(response.headers)
    if (newToken) {
      console.log(`email OTP | New token obtained: ${newToken}`)
    }

    return { newToken }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("OTP verification failed:", error.response?.status, error.response?.data)
      throw new Error(error.response?.data?.message || "OTP verification failed")
    }
    throw error
  }
}

export const verifyMfa = async (
  code: string,
  token: string
): Promise<{ success: boolean; token?: string; error?: string }> => {
  console.log(`MFA verification step | Using code: ${code} and token: ${token}`)
  try {
    const response = await api.post("/mfa-login", {
      code: code,
      token: "",
      redirect: "",
    }, {
      headers: {
        ...(token && { Cookie: `substack.sid=${token}` }),
      },
    })

    console.log("MFA verification response status:", response.status)
    console.log("MFA verification response data:", JSON.stringify(response.data, null, 2))

    // Check for API errors
    if (response.data.error || response.data.errors) {
      const errorMessage = response.data.error || response.data.errors?.[0]?.message || "MFA verification failed"
      return { success: false, error: errorMessage }
    }

    // Extract new token if available
    const newToken = extractTokenFromHeaders(response.headers)

    return {
      success: true,
      token: newToken || token // Return new token or keep existing
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("MFA verification failed:", error.response?.status, error.response?.data)
      return {
        success: false,
        error: error.response?.data?.message || "MFA verification failed"
      }
    }
    return { success: false, error: "An unexpected error occurred" }
  }
}