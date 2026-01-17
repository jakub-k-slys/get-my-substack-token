import type { FullConfig } from "@playwright/test"
import type { Server } from "http"

declare global {
  var __MOCK_SERVER__: Server | undefined
}

async function globalTeardown(_config: FullConfig) {
  const server = globalThis.__MOCK_SERVER__
  if (server) {
    await new Promise<void>((resolve) => {
      server.close(() => {
        console.log("Mock Substack server stopped")
        resolve()
      })
    })
  }
}

export default globalTeardown
