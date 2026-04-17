"use client";

import { useRef, useEffect, useState } from "react";
import { ChatMessage } from "./ChatMessage";
import { TypingIndicator } from "./TypingIndicator";
import Image from "next/image";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatMessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

export function ChatMessageList({
  messages,
  isLoading = false,
}: ChatMessageListProps): React.ReactNode {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Check if user is scrolled to bottom
  const isAtBottom = (): boolean => {
    const container = containerRef.current;
    if (!container) return true;
    const threshold = 100;
    return (
      container.scrollHeight - container.scrollTop - container.clientHeight <
      threshold
    );
  };

  // Handle scroll to detect if user scrolled up
  const handleScroll = (): void => {
    setShouldAutoScroll(isAtBottom());
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (shouldAutoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, isLoading, shouldAutoScroll]);

  // Empty state
  if (messages.length === 0 && !isLoading) {
    return (
      <div
        ref={containerRef}
        className="flex-1 flex flex-col items-center justify-center"
        style={{ padding: "var(--spacing-6)" }}
      >
        {/* Faded Logo */}
        <div style={{ opacity: 0.2, marginBottom: "var(--spacing-6)" }}>
          {imageError ? (
            <span
              className="font-bold"
              style={{
                color: "var(--color-primary)",
                fontSize: "var(--font-size-3xl)",
              }}
            >
              APEX
            </span>
          ) : (
            <Image
              src="/images/apex-logo-horizontal-color.png"
              alt=""
              width={200}
              height={53}
              style={{ height: "auto", maxWidth: "200px" }}
              onError={() => setImageError(true)}
              priority
            />
          )}
        </div>

        {/* Welcome Text */}
        <h2
          style={{
            fontSize: "var(--font-size-xl)",
            fontWeight: "var(--font-weight-semibold)",
            color: "var(--color-text-primary)",
            marginBottom: "var(--spacing-2)",
            textAlign: "center",
          }}
        >
          Start your technical evaluation
        </h2>
        <p
          style={{
            fontSize: "var(--font-size-base)",
            color: "var(--color-text-muted)",
            textAlign: "center",
            maxWidth: "400px",
          }}
        >
          Answer the questions to demonstrate your JavaScript and React
          expertise
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto"
      style={{ padding: "var(--spacing-6)" }}
      onScroll={handleScroll}
      role="log"
      aria-live="polite"
    >
      <div
        className="mx-auto"
        style={{ maxWidth: "var(--chat-max-width)" }}
      >
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            content={message.content}
            role={message.role}
            timestamp={message.timestamp}
          />
        ))}

        {isLoading && (
          <div style={{ marginTop: "var(--spacing-4)" }}>
            <TypingIndicator />
          </div>
        )}
      </div>
    </div>
  );
}
