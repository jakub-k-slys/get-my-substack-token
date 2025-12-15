import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Forward cookies from client to Substack
    const cookieHeader = request.headers.get("cookie")

    const response = await fetch("https://substack.com/api/v1/mfa-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    // Extract Set-Cookie headers from Substack response
    const setCookieHeaders = response.headers.getSetCookie()

    // Create response with the data
    const nextResponse = NextResponse.json(data, { status: response.status })

    // Forward cookies from Substack to client
    setCookieHeaders.forEach((cookie) => {
      nextResponse.headers.append("Set-Cookie", cookie)
    })

    return nextResponse
  } catch (error) {
    console.error("MFA login proxy error:", error)
    return NextResponse.json({ error: "Failed to process MFA login" }, { status: 500 })
  }
}
