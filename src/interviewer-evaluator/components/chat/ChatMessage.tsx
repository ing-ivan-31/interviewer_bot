"use client";

import { CodeBlock } from "./CodeBlock";

interface ChatMessageProps {
  content: string;
  role: "user" | "assistant";
  timestamp?: Date;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Parse message content for code blocks
function parseContent(content: string): React.ReactNode[] {
  const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      const text = content.substring(lastIndex, match.index);
      if (text.trim()) {
        parts.push(
          <p key={key++} className="whitespace-pre-wrap">
            {text}
          </p>
        );
      }
    }

    // Add code block
    const language = match[1] || "javascript";
    const code = match[2];
    parts.push(<CodeBlock key={key++} code={code} language={language} />);

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    const text = content.substring(lastIndex);
    if (text.trim()) {
      parts.push(
        <p key={key++} className="whitespace-pre-wrap">
          {text}
        </p>
      );
    }
  }

  // If no parts were added, treat entire content as text
  if (parts.length === 0) {
    parts.push(
      <p key={0} className="whitespace-pre-wrap">
        {content}
      </p>
    );
  }

  return parts;
}

export function ChatMessage({
  content,
  role,
  timestamp,
}: ChatMessageProps): React.ReactNode {
  const isUser = role === "user";

  return (
    <div
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      style={{ marginBottom: "var(--spacing-4)" }}
    >
      {/* Avatar */}
      <div
        className="flex-shrink-0 flex items-center justify-center rounded-full"
        style={{
          width: "32px",
          height: "32px",
          background: "var(--grey-2)",
        }}
      >
        {isUser ? (
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
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        ) : (
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
        )}
      </div>

      {/* Message Content */}
      <div style={{ maxWidth: "80%" }}>
        {/* Header */}
        <div
          className={`flex items-center gap-2 mb-1 ${
            isUser ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <span
            style={{
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--color-text-primary)",
            }}
          >
            {isUser ? "You" : "Evaluator"}
          </span>
          {timestamp && (
            <span
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--color-text-muted)",
              }}
            >
              {formatTime(timestamp)}
            </span>
          )}
        </div>

        {/* Bubble */}
        <div
          style={{
            background: isUser
              ? "var(--chat-user-bubble-bg)"
              : "var(--chat-ai-bubble-bg)",
            color: isUser
              ? "var(--chat-user-bubble-text)"
              : "var(--chat-ai-bubble-text)",
            padding: "var(--spacing-3) var(--spacing-4)",
            borderRadius: isUser
              ? "var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-lg)"
              : "var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm)",
            fontSize: "var(--font-size-base)",
            lineHeight: "var(--line-height-relaxed)",
            wordWrap: "break-word",
            overflowWrap: "break-word",
          }}
        >
          {parseContent(content)}
        </div>
      </div>
    </div>
  );
}
