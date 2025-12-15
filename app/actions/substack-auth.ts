"use server"

import { cookies } from "next/headers"

export async function emailLogin(email: string) {
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
  })

  const data = await response.json()

  // Extract and set cookies from Substack response
  const setCookieHeaders = response.headers.getSetCookie()
  const cookieStore = await cookies()

  setCookieHeaders.forEach((cookieString) => {
    // Parse the cookie string
    const [nameValue, ...attributes] = cookieString.split(";")
    const [name, value] = nameValue.split("=")

    // Set the cookie
    cookieStore.set(name.trim(), value.trim(), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    })
  })

  return data
}

export async function verifyEmailOtp(code: string, email: string) {
  const cookieStore = await cookies()
  const substackSid = cookieStore.get("substack.sid")

  const response = await fetch("https://substack.com/api/v1/email-otp-login/complete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(substackSid && { Cookie: `substack.sid=${substackSid.value}` }),
    },
    body: JSON.stringify({
      code,
      email,
      redirect: "https://substack.com/home",
    }),
  })

  const data = await response.json()

  // Update cookies from response
  const setCookieHeaders = response.headers.getSetCookie()
  setCookieHeaders.forEach((cookieString) => {
    const [nameValue, ...attributes] = cookieString.split(";")
    const [name, value] = nameValue.split("=")

    cookieStore.set(name.trim(), value.trim(), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    })
  })

  return data
}

export async function verifyMfa(code: string, token: string) {
  const cookieStore = await cookies()
  const substackSid = cookieStore.get("substack.sid")

  const response = await fetch("https://substack.com/api/v1/mfa-login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(substackSid && { Cookie: `substack.sid=${substackSid.value}` }),
    },
    body: JSON.stringify({
      code,
      token,
      redirect: "",
    }),
  })

  const data = await response.json()

  // Update cookies from response
  const setCookieHeaders = response.headers.getSetCookie()
  setCookieHeaders.forEach((cookieString) => {
    const [nameValue, ...attributes] = cookieString.split(";")
    const [name, value] = nameValue.split("=")

    cookieStore.set(name.trim(), value.trim(), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    })
  })

  return data
}

export async function getSessionToken() {
  const cookieStore = await cookies()
  const substackSid = cookieStore.get("substack.sid")
  return substackSid?.value || ""
}
