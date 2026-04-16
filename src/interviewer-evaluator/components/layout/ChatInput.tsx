"use client";

import { useRef, useEffect, KeyboardEvent } from "react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Type a message...",
  disabled = false,
}: ChatInputProps): React.ReactNode {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content (up to 4 lines)
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const lineHeight = 24; // approximate line height
      const maxHeight = lineHeight * 4;
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
    }
  }, [value]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSubmit();
      }
    }
  };

  const handleSubmitClick = (): void => {
    if (value.trim() && !disabled) {
      onSubmit();
    }
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 pb-4 px-4"
      style={{
        background: "linear-gradient(transparent, var(--color-background) 30%)",
      }}
    >
      <div
        className="mx-auto"
        style={{ maxWidth: "var(--chat-max-width)" }}
      >
        <div
          className="flex items-end gap-2 p-3"
          style={{
            background: "var(--chat-input-bg)",
            border: "1px solid var(--chat-input-border)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          {/* Attachment button */}
          <button
            className="p-2 rounded-full transition-colors flex-shrink-0"
            style={{ color: "var(--color-text-muted)" }}
            aria-label="Attach file"
            disabled={disabled}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </button>

          {/* Text input */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="flex-1 resize-none bg-transparent outline-none text-sm"
            style={{
              color: "var(--color-text-primary)",
              minHeight: "24px",
              maxHeight: "96px", // 4 lines
            }}
          />

          {/* Submit button */}
          <button
            onClick={handleSubmitClick}
            disabled={disabled || !value.trim()}
            className="p-2 rounded-full transition-all flex-shrink-0"
            style={{
              background: disabled || !value.trim() ? "var(--grey-2)" : "var(--color-primary)",
              color: "var(--white)",
              width: "40px",
              height: "40px",
              opacity: disabled || !value.trim() ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!disabled && value.trim()) {
                e.currentTarget.style.background = "var(--color-primary-hover)";
              }
            }}
            onMouseLeave={(e) => {
              if (!disabled && value.trim()) {
                e.currentTarget.style.background = "var(--color-primary)";
              }
            }}
            aria-label="Send message"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto"
            >
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
          </button>
        </div>

        {/* Footer disclaimer */}
        <p
          className="text-center mt-2 text-xs"
          style={{ color: "var(--color-text-muted)" }}
        >
          AI responses are generated and may contain errors. Review before using.
        </p>
      </div>
    </div>
  );
}
