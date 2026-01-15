import type { FullConfig } from "@playwright/test"

async function globalTeardown(config: FullConfig) {
  const server = (globalThis as any).__MOCK_SERVER__
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
