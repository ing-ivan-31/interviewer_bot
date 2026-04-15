"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useIsAuthenticated } from "@azure/msal-react";
import { signIn } from "@/lib/auth/auth";

export default function LoginPage(): React.ReactNode {
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isAuthenticated) {
      const returnTo = searchParams.get("returnTo") ?? "/evaluation";
      router.replace(returnTo);
    }
  }, [isAuthenticated, router, searchParams]);

  const handleSignIn = async (): Promise<void> => {
    const returnTo = searchParams.get("returnTo") ?? "/evaluation";
    await signIn(returnTo);
  };

  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-gray-600">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            JS/React Interviewer Evaluator
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to start your technical evaluation
          </p>
        </div>

        <button
          onClick={handleSignIn}
          className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
        >
          Sign in with Microsoft
        </button>
      </div>
    </div>
  );
}
