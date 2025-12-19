"use server"

import { cookies } from "next/headers"

export async function emailLogin(email: string) : Promise<{token: string}> {
  const response = await fetch("https://substack.com/api/v1/email-login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      redirect: "/home",
      can_create_user: true,
    }),
    credentials: "include",
  })
  const substackSid = response.headers.getSetCookie().find(cookie => cookie.includes("substack.sid"))!
  return { token: substackSid.split(';')[0].split('=')[1] }
}

export async function verifyEmailOtp(code: string, email: string, token: string) {
  const response = await fetch("https://substack.com/api/v1/email-otp-login/complete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Cookie: `substack.sid=${token}` }),
    },
    body: JSON.stringify({
      code,
      email,
      redirect: "https://substack.com/home",
    }),
  })

  console.log("OTP verification response status:", response.status)

  const data = await response.json()
  console.log("OTP verification response data:", JSON.stringify(data, null, 2))

  if (!response.ok) {
    console.error("OTP verification failed with status:", response.status)
  }
  return data
}

export async function verifyMfa(code: string, token: string) {
  console.log("Verifying MFA with code:", code, "has token:", !!token)

  const response = await fetch("https://substack.com/api/v1/mfa-login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Cookie: `substack.sid=${token}` }),
    },
    body: JSON.stringify({
      code,
      token,
      redirect: "",
    }),
  })

  console.log("MFA verification response status:", response.status)

  const data = await response.json()
  console.log("MFA verification response data:", JSON.stringify(data, null, 2))
  return data
}