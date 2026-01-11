"use server"

import axios from "axios"

const api = axios.create({
  baseURL: "https://substack.com/api/v1/",
  headers: {
    Accept: '*/*',
    'Content-Type': 'application/json',
    'User-Agent': 'PostmanRuntime/7.51.0',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
  },
})

export async function emailLogin(email: string) : Promise<{token: string | undefined}> {
  console.log(`email OTP initiated | Using email ${email}`)
  try {
    const request =  {
      email: email,
      redirect: '/home',
      can_create_user: true,
    }
    const response = await api.post('/email-login', request)
    if (response.data) {
      console.log(response.data)
    }

    let token: string | undefined
    const setCookieHeaders = response.headers['set-cookie']
    if (setCookieHeaders) {
      const substackSid = setCookieHeaders.find(cookie => cookie.includes("substack.sid"))
      if (substackSid) {
        token = substackSid.split(';')[0].split('=')[1]
        console.log(`email OTP initiated | New token obtained: ${token}`)
      }
    }
    return { token: token }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Email login failed:", error.response?.status, error.response?.data)
      throw new Error(error.response?.data?.message || "Email login failed")
    }
    throw error
  }
}

export async function verifyEmailOtp(code: string, email: string, token: string | undefined) {
  console.log(`email OTP verification step | Using code ${code}, email ${email} and token ${token}`)
  try {
    const response = await api.post("/email-otp-login/complete/", {
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

    const setCookieHeaders = response.headers['set-cookie']
    if (setCookieHeaders) {
      const substackSid = setCookieHeaders.find(cookie => cookie.includes("substack.sid"))
      if (substackSid) {
        token = substackSid.split(';')[0].split('=')[1]
        console.log(`email OTP | New token obtained: ${token}`)
      }
    }
    return { newToken: token }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("OTP verification failed:", error.response?.status, error.response?.data)
      throw new Error(error.response?.data?.message || "OTP verification failed")
    }
    throw error
  }
}

export async function verifyMfa(code: string, token: string) {
  console.log(`MFA verification step | Using code: ${code} and token: ${token}`)
  try {
    const response = await api.post("/mfa-login/", {
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
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("MFA verification failed:", error.response?.status, error.response?.data)
      throw new Error(error.response?.data?.message || "MFA verification failed")
    }
    throw error
  }
}