"use client";

import { useMsal } from "@azure/msal-react";
import { useSearchParams } from "next/navigation";
import { defaultScopes } from "@/lib/auth/msal-config";

export default function LoginPage() {
  const { instance } = useMsal();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/evaluation";

  function handleSignIn(): void {
    instance.loginRedirect({
      scopes: defaultScopes,
      state: from,
    });
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          JS/React Evaluator
        </h1>
        <p className="mb-8 text-sm text-gray-500">
          Sign in with your Microsoft account to continue.
        </p>
        <button
          type="button"
          onClick={handleSignIn}
          className="flex w-full items-center justify-center gap-3 rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <MicrosoftIcon />
          Sign in with Microsoft
        </button>
      </div>
    </main>
  );
}

function MicrosoftIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 23 23"
      width="20"
      height="20"
      aria-hidden="true"
    >
      <rect x="1" y="1" width="10" height="10" fill="#f25022" />
      <rect x="12" y="1" width="10" height="10" fill="#7fba00" />
      <rect x="1" y="12" width="10" height="10" fill="#00a4ef" />
      <rect x="12" y="12" width="10" height="10" fill="#ffb900" />
    </svg>
  );
}
