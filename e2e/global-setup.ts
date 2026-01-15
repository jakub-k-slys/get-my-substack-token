import type { FullConfig } from "@playwright/test"
import { app } from "./mocks/substack-mock-server"
import type { Server } from "http"

let server: Server

async function globalSetup(config: FullConfig) {
  const port = 3001

  server = app.listen(port, () => {
    console.log(`Mock Substack server started on http://localhost:${port}`)
  })

  // Store server reference for teardown
  ;(global as any).__MOCK_SERVER__ = server
}

export default globalSetup
