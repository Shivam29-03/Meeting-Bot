"use client";

import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

import { LoginHero } from "@/components/auth/login-hero";
import { Logo } from "@/components/brand/Logo";
import { Button, Input, Loading } from "@/components/ui";

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function LoginForm() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const authError = searchParams.get("error");

  const errorMessage =
    authError === "OAuthCallback"
      ? "Google sign-in failed. Verify your OAuth credentials and redirect URI in Google Cloud Console."
      : authError
        ? "Sign-in failed. Please try again."
        : null;

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await handleGoogleSignIn();
  };

  if (status === "loading" || status === "authenticated") {
    return <Loading fullScreen label="Checking session..." />;
  }

  return (
    <div className="flex min-h-screen">
      <LoginHero />

      <div className="flex w-full flex-col bg-background lg:w-1/2">
        <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-20">
          <div className="mb-8 lg:hidden">
            <Logo theme="light" />
          </div>

          <div className="mx-auto w-full max-w-md">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your credentials to access your account.
            </p>

            {errorMessage ? (
              <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorMessage}
              </p>
            ) : null}

            <Button
              type="button"
              variant="outline"
              className="mt-8 h-12 w-full gap-3 rounded-xl border-slate-200 bg-white text-sm font-medium shadow-sm hover:bg-slate-50"
              disabled={loading}
              onClick={handleGoogleSignIn}
            >
              {loading ? (
                <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <GoogleIcon />
              )}
              Sign in with Google
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                >
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@company.com"
                  className="h-11 rounded-xl border-slate-200 bg-slate-50 px-4"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-xs font-medium text-primary hover:text-primary/80"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className="h-11 rounded-xl border-slate-200 bg-slate-50 px-4 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="size-4 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-muted-foreground">
                  Keep me signed in
                </span>
              </label>

              <Button
                type="submit"
                disabled={loading}
                className="h-12 w-full gap-2 rounded-xl text-sm font-semibold"
              >
                Sign in to Dashboard
                <ArrowRight className="size-4" />
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="#" className="font-medium text-primary hover:text-primary/80">
                Start a free trial
              </Link>
            </p>
          </div>
        </div>

        <footer className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-slate-200 px-6 py-4 text-xs text-muted-foreground">
          <Link href="#" className="hover:text-foreground">
            Help Center
          </Link>
          <Link href="#" className="hover:text-foreground">
            Privacy Policy
          </Link>
          <Link href="#" className="hover:text-foreground">
            Contact Support
          </Link>
        </footer>
      </div>
    </div>
  );
}
