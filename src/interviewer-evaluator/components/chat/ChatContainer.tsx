"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ChatMessageList, type Message } from "./ChatMessageList";
import { ChatInput } from "@/components/layout/ChatInput";
import { useEvaluationStore } from "@/lib/stores/evaluation-store";

interface ChatContainerProps {
  sessionId: string;
}

export function ChatContainer({
  sessionId,
}: ChatContainerProps): React.ReactNode {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    isLoadingResponse,
    addMessage,
    setIsLoadingResponse,
  } = useEvaluationStore();

  // Convert store messages to the format expected by ChatMessageList
  const formattedMessages: Message[] = messages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp),
  }));

  const handleSubmit = useCallback((): void => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue || isLoadingResponse) return;

    // Add user message
    const userMessage = {
      id: `msg-${Date.now()}-user`,
      role: "user" as const,
      content: trimmedValue,
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInputValue("");
    setIsLoadingResponse(true);

    // Simulate AI response (to be replaced with actual API call)
    // This is a placeholder - actual implementation will use WebSocket
    setTimeout(() => {
      const aiMessage = {
        id: `msg-${Date.now()}-ai`,
        role: "assistant" as const,
        content:
          "Thank you for your response. Let me evaluate your answer...\n\nThis is a placeholder response. The actual AI evaluation will be implemented with the WebSocket connection to the backend.",
        timestamp: new Date(),
      };
      addMessage(aiMessage);
      setIsLoadingResponse(false);
    }, 2000);
  }, [inputValue, isLoadingResponse, addMessage, setIsLoadingResponse]);

  // Focus input after sending message
  useEffect(() => {
    if (!isLoadingResponse && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoadingResponse]);

  return (
    <div
      className="flex flex-col h-full"
      style={{ minHeight: "calc(100vh - var(--header-height))" }}
    >
      {/* Messages Area */}
      <ChatMessageList
        messages={formattedMessages}
        isLoading={isLoadingResponse}
      />

      {/* Input Area */}
      <div
        className="sticky bottom-0"
        style={{
          padding: "var(--spacing-4)",
          background: "var(--color-background)",
        }}
      >
        <div
          className="mx-auto"
          style={{ maxWidth: "var(--chat-max-width)" }}
        >
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleSubmit}
            disabled={isLoadingResponse}
            placeholder="Type your answer..."
          />
        </div>
      </div>
    </div>
  );
}
