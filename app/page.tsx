import AuthFlow from "@/components/auth-flow"

export default function Home() {
  return (
    <main data-testid="main-container" className="min-h-screen flex items-center justify-center bg-background p-4">
      <AuthFlow />
    </main>
  )
}
