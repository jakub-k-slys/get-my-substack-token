import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch("https://substack.com/api/v1/email-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
    console.error("Email login proxy error:", error)
    return NextResponse.json({ error: "Failed to process email login" }, { status: 500 })
  }
}
