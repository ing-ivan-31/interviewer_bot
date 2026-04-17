"use client";

export function TypingIndicator(): React.ReactNode {
  return (
    <div className="flex items-start gap-3">
      {/* AI Avatar */}
      <div
        className="flex-shrink-0 flex items-center justify-center rounded-full"
        style={{
          width: "32px",
          height: "32px",
          background: "var(--grey-2)",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: "var(--color-primary)" }}
        >
          <path d="M12 8V4H8" />
          <rect width="16" height="12" x="4" y="8" rx="2" />
          <path d="M2 14h2" />
          <path d="M20 14h2" />
          <path d="M15 13v2" />
          <path d="M9 13v2" />
        </svg>
      </div>

      {/* Typing Dots */}
      <div
        className="flex items-center gap-1 rounded-lg"
        style={{
          background: "var(--chat-ai-bubble-bg)",
          padding: "var(--spacing-3) var(--spacing-4)",
          borderRadius:
            "var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm)",
        }}
      >
        <span
          className="typing-dot"
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "var(--teal-1)",
            animation: "bounce 1.4s infinite ease-in-out both",
            animationDelay: "0s",
          }}
        />
        <span
          className="typing-dot"
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "var(--teal-1)",
            animation: "bounce 1.4s infinite ease-in-out both",
            animationDelay: "0.2s",
          }}
        />
        <span
          className="typing-dot"
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "var(--teal-1)",
            animation: "bounce 1.4s infinite ease-in-out both",
            animationDelay: "0.4s",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%,
          80%,
          100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-8px);
          }
        }
      `}</style>
    </div>
  );
}
