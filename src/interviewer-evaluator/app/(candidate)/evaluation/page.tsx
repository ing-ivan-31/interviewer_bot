"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { EvaluationLayout } from "@/components/layout";
import { ChatContainer } from "@/components/chat";
import { useEvaluationStore } from "@/lib/stores/evaluation-store";

export default function EvaluationPage(): React.ReactNode {
  const isAuthenticated = useIsAuthenticated();
  const { inProgress } = useMsal();
  const router = useRouter();
  const { sessionId, setSessionId } = useEvaluationStore();

  useEffect(() => {
    if (inProgress === "none" && !isAuthenticated) {
      const returnTo = encodeURIComponent("/evaluation");
      router.replace(`/login?returnTo=${returnTo}`);
    }
  }, [isAuthenticated, inProgress, router]);

  // Initialize session if not present
  useEffect(() => {
    if (isAuthenticated && !sessionId) {
      // Generate a temporary session ID for demo
      // This will be replaced with actual API call to start a session
      const newSessionId = `session-${Date.now()}`;
      setSessionId(newSessionId);
    }
  }, [isAuthenticated, sessionId, setSessionId]);

  if (inProgress !== "none") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div
            className="mb-4 h-8 w-8 animate-spin rounded-full border-4 mx-auto"
            style={{
              borderColor: "var(--color-primary)",
              borderTopColor: "transparent",
            }}
          />
          <p
            style={{
              fontSize: "var(--font-size-lg)",
              color: "var(--color-text-muted)",
            }}
          >
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p
          style={{
            fontSize: "var(--font-size-lg)",
            color: "var(--color-text-muted)",
          }}
        >
          Redirecting to login...
        </p>
      </div>
    );
  }

  return (
    <EvaluationLayout>
      {sessionId ? (
        <ChatContainer sessionId={sessionId} />
      ) : (
        <div className="flex items-center justify-center h-full">
          <div
            className="h-8 w-8 animate-spin rounded-full border-4"
            style={{
              borderColor: "var(--color-primary)",
              borderTopColor: "transparent",
            }}
          />
        </div>
      )}
    </EvaluationLayout>
  );
}
