"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { msalInstance } from "@/lib/auth/msal-config";

type CallbackStatus = "processing" | "success" | "error";

interface CallbackState {
  status: CallbackStatus;
  errorMessage: string | null;
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [state, setState] = useState<CallbackState>({
    status: "processing",
    errorMessage: null,
  });

  useEffect(() => {
    async function handleCallback(): Promise<void> {
      try {
        const result = await msalInstance.handleRedirectPromise();

        if (result !== null) {
          // Successful authentication — set a presence cookie so middleware
          // knows this session is authenticated. The cookie carries no sensitive
          // data; actual tokens live in MSAL's sessionStorage cache.
          document.cookie =
            "auth-session=1; path=/; SameSite=Strict; max-age=86400";

          // Redirect to the originally requested route (carried in MSAL state)
          // or fall back to /evaluation.
          const destination =
            typeof result.state === "string" && result.state.startsWith("/")
              ? result.state
              : "/evaluation";

          setState({ status: "success", errorMessage: null });
          router.replace(destination);
        } else {
          // handleRedirectPromise() returned null — not a redirect callback.
          // Check if we already have an active account (page reload scenario).
          const accounts = msalInstance.getAllAccounts();
          if (accounts.length > 0) {
            router.replace("/evaluation");
          } else {
            router.replace("/login");
          }
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "An unknown error occurred.";
        setState({ status: "error", errorMessage: message });
      }
    }

    handleCallback();
  }, [router]);

  if (state.status === "error") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-2 text-xl font-bold text-red-600">
            Authentication Error
          </h1>
          <p className="mb-6 text-sm text-gray-700">{state.errorMessage}</p>
          <a
            href="/login"
            className="inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Try again
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-sm text-gray-500">Completing sign in&hellip;</p>
      </div>
    </main>
  );
}
