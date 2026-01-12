"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useAuthFlow, type UseAuthFlowReturn } from "./use-auth-flow"

const AuthFlowContext = createContext<UseAuthFlowReturn | null>(null)

export const AuthFlowProvider = ({ children }: { children: ReactNode }) => {
  const authFlow = useAuthFlow()

  return <AuthFlowContext.Provider value={authFlow}>{children}</AuthFlowContext.Provider>
}

export const useAuthFlowContext = () => {
  const context = useContext(AuthFlowContext)
  if (!context) {
    throw new Error("useAuthFlowContext must be used within AuthFlowProvider")
  }
  return context
}
