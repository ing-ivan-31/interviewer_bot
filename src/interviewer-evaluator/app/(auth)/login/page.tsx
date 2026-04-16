"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useIsAuthenticated } from "@azure/msal-react";
import { signIn } from "@/lib/auth/auth";
import Image from "next/image";

export default function LoginPage(): React.ReactNode {
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const returnTo = searchParams.get("returnTo") ?? "/evaluation";
      router.replace(returnTo);
    }
  }, [isAuthenticated, router, searchParams]);

  const handleSignIn = async (): Promise<void> => {
    if (isLoading) return;
    setIsLoading(true);
    const returnTo = searchParams.get("returnTo") ?? "/evaluation";
    await signIn(returnTo);
  };

  if (isAuthenticated) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: "var(--color-surface)" }}
      >
        <p
          className="text-lg"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Redirecting...
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4"
      style={{ background: "var(--color-surface)" }}
    >
      <div
        className="w-full max-w-[400px] rounded-lg p-10"
        style={{
          background: "var(--color-background)",
          boxShadow: "var(--shadow-lg)",
          borderRadius: "var(--radius-lg)",
        }}
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          {imageError ? (
            <span
              className="font-bold text-lg"
              style={{ color: "var(--color-primary)" }}
            >
              APEX SYSTEMS
            </span>
          ) : (
            <Image
              src="/images/apex-logo-horizontal-color.png"
              alt="Apex Systems"
              width={180}
              height={48}
              style={{ height: "48px", width: "auto" }}
              onError={() => setImageError(true)}
              priority
            />
          )}
        </div>

        {/* Title */}
        <h1
          className="text-center font-bold mb-2"
          style={{
            fontSize: "var(--font-size-2xl)",
            color: "var(--color-text-primary)",
          }}
        >
          JS/React Interviewer Evaluator
        </h1>

        {/* Subtitle */}
        <p
          className="text-center mb-8"
          style={{
            fontSize: "var(--font-size-sm)",
            color: "var(--color-text-secondary)",
          }}
        >
          Sign in to start your technical evaluation
        </p>

        {/* Sign in button */}
        <button
          onClick={handleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{
            background: "var(--color-primary)",
            color: "var(--white)",
            fontSize: "var(--font-size-sm)",
            padding: "var(--spacing-3) var(--spacing-4)",
            borderRadius: "var(--radius-md)",
            height: "48px",
            opacity: isLoading ? 0.7 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.background = "var(--color-primary-hover)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--color-primary)";
          }}
        >
          {isLoading ? (
            <>
              <div
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
              />
              Signing in...
            </>
          ) : (
            <>
              {/* Microsoft icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 23 23"
                fill="currentColor"
              >
                <path d="M0 0h11v11H0V0zm12 0h11v11H12V0zM0 12h11v11H0V12zm12 0h11v11H12V12z" />
              </svg>
              Sign in with Microsoft
            </>
          )}
        </button>
      </div>

      {/* Footer */}
      <p
        className="mt-6 text-center"
        style={{
          fontSize: "var(--font-size-xs)",
          color: "var(--color-text-muted)",
        }}
      >
        Powered by Apex Systems
      </p>
    </div>
  );
}
