import type { Metadata } from "next"
import Link from "next/link"
import { AuthCard } from "@/components/auth/auth-card"
import { LoginForm } from "@/components/auth/login-form"
import { OAuthButtons } from "@/components/auth/oauth-buttons"
import { GuestButton } from "@/components/auth/guest-button"
import { config } from "@/lib/config"

export const metadata: Metadata = {
  title: "Log In",
  robots: { index: false },
  alternates: {
    canonical: `${config.app.url}/login`,
  },
}

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-foreground underline">
            Sign up
          </Link>
        </>
      }
    >
      <LoginForm />
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">or</span>
        </div>
      </div>
      <OAuthButtons />
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">or</span>
        </div>
      </div>
      <GuestButton className="w-full" />
    </AuthCard>
  )
}
