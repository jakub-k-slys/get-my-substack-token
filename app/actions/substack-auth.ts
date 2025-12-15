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

  console.log("Verifying OTP with code:", code, "email:", email, "has sid:", !!substackSid)

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

  console.log("OTP verification response status:", response.status)

  const data = await response.json()
  console.log("OTP verification response data:", JSON.stringify(data, null, 2))

  // Check if the response was not OK
  if (!response.ok) {
    console.error("OTP verification failed with status:", response.status)
    // Return the error data so the client can display it
    return data
  }

  // Extract the session token from Set-Cookie headers
  const setCookieHeaders = response.headers.getSetCookie()
  console.log("Setting cookies:", setCookieHeaders.length)

  let sessionToken = ""

  setCookieHeaders.forEach((cookieString) => {
    const [nameValue, ...attributes] = cookieString.split(";")
    const [name, value] = nameValue.split("=")
    const cookieName = name.trim()
    const cookieValue = value.trim()

    // Extract the substack.sid cookie value
    if (cookieName === "substack.sid") {
      // Decode the URL-encoded cookie value
      sessionToken = decodeURIComponent(cookieValue)
      console.log("Found session token:", sessionToken)
    }

    // Store cookies locally (though they won't work cross-domain)
    cookieStore.set(cookieName, cookieValue, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    })
  })

  // Add the session token to the response data
  return {
    ...data,
    sessionToken,
  }
}

export async function verifyMfa(code: string, token: string) {
  const cookieStore = await cookies()
  const substackSid = cookieStore.get("substack.sid")

  console.log("Verifying MFA with code:", code, "has token:", !!token)

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

  console.log("MFA verification response status:", response.status)

  const data = await response.json()
  console.log("MFA verification response data:", JSON.stringify(data, null, 2))

  // Extract the session token from Set-Cookie headers
  const setCookieHeaders = response.headers.getSetCookie()
  console.log("Setting cookies:", setCookieHeaders.length)

  let sessionToken = ""

  setCookieHeaders.forEach((cookieString) => {
    const [nameValue, ...attributes] = cookieString.split(";")
    const [name, value] = nameValue.split("=")
    const cookieName = name.trim()
    const cookieValue = value.trim()

    // Extract the substack.sid cookie value
    if (cookieName === "substack.sid") {
      // Decode the URL-encoded cookie value
      sessionToken = decodeURIComponent(cookieValue)
      console.log("Found session token from MFA:", sessionToken)
    }

    // Store cookies locally (though they won't work cross-domain)
    cookieStore.set(cookieName, cookieValue, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    })
  })

  // Add the session token to the response data
  return {
    ...data,
    sessionToken,
  }
}

export async function getSessionToken() {
  const cookieStore = await cookies()
  const substackSid = cookieStore.get("substack.sid")
  return substackSid?.value || ""
}
