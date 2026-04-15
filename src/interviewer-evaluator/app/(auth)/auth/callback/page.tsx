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
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">
              Authentication Error
            </h1>
            <p className="mt-2 text-sm text-gray-600">{error}</p>
          </div>

          <button
            onClick={() => router.replace("/login")}
            className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
        <p className="text-lg text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}
