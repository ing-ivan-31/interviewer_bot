"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMsal } from "@azure/msal-react";
import { AuthenticationResult } from "@azure/msal-browser";

interface RedirectState {
  redirectPath?: string;
}

export default function AuthCallbackPage(): React.ReactNode {
  const { instance } = useMsal();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleRedirect = async (): Promise<void> => {
      try {
        const response = await instance.handleRedirectPromise();

        if (response) {
          handleSuccessfulAuth(response);
          return;
        }

        // If no response, check if we already have an account
        const accounts = instance.getAllAccounts();
        if (accounts.length > 0) {
          router.replace("/evaluation");
          return;
        }

        // No response and no accounts - redirect to login
        router.replace("/login");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Authentication failed";
        setError(errorMessage);
      }
    };

    const handleSuccessfulAuth = (response: AuthenticationResult): void => {
      let redirectPath = "/evaluation";

      if (response.state) {
        try {
          const state = JSON.parse(response.state) as RedirectState;
          if (state.redirectPath) {
            redirectPath = state.redirectPath;
          }
        } catch {
          // Invalid state JSON, use default redirect
        }
      }

      router.replace(redirectPath);
    };

    handleRedirect();
  }, [instance, router]);

  if (error) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center px-4"
        style={{ background: "var(--color-surface)" }}
      >
        <div
          className="w-full max-w-[400px] p-10"
          style={{
            background: "var(--color-background)",
            boxShadow: "var(--shadow-lg)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "#FEE2E2" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: "var(--color-error)" }}
              >
                <circle cx="12" cy="12" r="10" />
                <path d="m15 9-6 6" />
                <path d="m9 9 6 6" />
              </svg>
            </div>
          </div>

          {/* Error Title */}
          <h1
            className="text-center font-bold mb-2"
            style={{
              fontSize: "var(--font-size-2xl)",
              color: "var(--color-error)",
            }}
          >
            Authentication Error
          </h1>

          {/* Error Message */}
          <p
            className="text-center mb-8"
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-secondary)",
            }}
          >
            {error}
          </p>

          {/* Return Button */}
          <button
            onClick={() => router.replace("/login")}
            className="w-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              background: "var(--color-primary)",
              color: "var(--white)",
              fontSize: "var(--font-size-sm)",
              padding: "var(--spacing-3) var(--spacing-4)",
              borderRadius: "var(--radius-md)",
              height: "48px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--color-primary-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--color-primary)";
            }}
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ background: "var(--color-surface)" }}
    >
      <div className="text-center">
        {/* Spinner */}
        <div
          className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent mx-auto"
          style={{ borderColor: "var(--color-primary)", borderTopColor: "transparent" }}
        />
        <p
          className="text-lg"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Completing sign in...
        </p>
      </div>
    </div>
  );
}
