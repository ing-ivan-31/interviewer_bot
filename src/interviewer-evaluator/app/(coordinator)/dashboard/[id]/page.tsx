"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { signOut } from "@/lib/auth/auth";

export default function EvaluationDetailPage(): React.ReactNode {
  const isAuthenticated = useIsAuthenticated();
  const { instance, inProgress } = useMsal();
  const router = useRouter();
  const params = useParams();
  const evaluationId = params.id as string;

  useEffect(() => {
    if (inProgress === "none" && !isAuthenticated) {
      const returnTo = encodeURIComponent(`/dashboard/${evaluationId}`);
      router.replace(`/login?returnTo=${returnTo}`);
    }
  }, [isAuthenticated, inProgress, router, evaluationId]);

  const handleSignOut = async (): Promise<void> => {
    await signOut();
  };

  const handleBack = (): void => {
    router.push("/dashboard");
  };

  if (inProgress !== "none") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-gray-600">Redirecting to login...</p>
      </div>
    );
  }

  const account = instance.getAllAccounts()[0];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Back to Dashboard
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              Evaluation Details
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {account?.name ?? account?.username ?? "Coordinator"}
            </span>
            <button
              onClick={handleSignOut}
              className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Evaluation: {evaluationId}
            </h2>
            <p className="text-gray-600">
              The evaluation detail view and report will be implemented here.
              Coordinators can view the full evaluation transcript, scores per
              topic, and the final recommendation.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
