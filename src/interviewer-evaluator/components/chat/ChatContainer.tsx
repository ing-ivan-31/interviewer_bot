"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ChatMessageList, type Message } from "./ChatMessageList";
import { ChatInput } from "@/components/layout/ChatInput";
import { useEvaluationStore } from "@/lib/stores/evaluation-store";
import { useEvaluationSocket } from "@/lib/hooks/useEvaluationSocket";

interface ChatContainerProps {
  sessionId?: string;
}

export function ChatContainer({
  sessionId: initialSessionId,
}: ChatContainerProps): React.ReactNode {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    sessionId,
    messages,
    isTyping,
    connectionStatus,
    addMessage,
    setSessionId,
    setTyping,
    setConnectionStatus,
  } = useEvaluationStore();

  // Initialize WebSocket hook with callbacks
  const { isConnected, isConnecting, connect, createSession, submitAnswer } =
    useEvaluationSocket({
      onSessionCreated: (data) => {
        setSessionId(data.sessionId);
        setTyping(false);
        addMessage({
          id: `msg-${Date.now()}-ai`,
          role: "assistant",
          content: data.question,
          timestamp: new Date(),
        });
      },
      onQuestionNew: (data) => {
        setTyping(false);
        addMessage({
          id: `msg-${Date.now()}-ai`,
          role: "assistant",
          content: data.question,
          timestamp: new Date(),
        });
      },
      onSessionComplete: (data) => {
        setTyping(false);
        addMessage({
          id: `msg-${Date.now()}-ai`,
          role: "assistant",
          content: data.message,
          timestamp: new Date(),
        });
      },
      onError: () => {
        setTyping(false);
      },
      onConnectionChange: (connected) => {
        setConnectionStatus(connected ? "connected" : "disconnected");
      },
    });

  // Connect on mount
  useEffect(() => {
    connect();
  }, [connect]);

  // Update connection status when connecting
  useEffect(() => {
    if (isConnecting) {
      setConnectionStatus("connecting");
    }
  }, [isConnecting, setConnectionStatus]);

  // Convert store messages to the format expected by ChatMessageList
  const formattedMessages: Message[] = messages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    timestamp:
      msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp),
  }));

  // Handle sending a message
  const handleSubmit = useCallback((): void => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue || isTyping || !isConnected) return;

    // Add user message to UI
    const userMessage = {
      id: `msg-${Date.now()}-user`,
      role: "user" as const,
      content: trimmedValue,
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInputValue("");

    // Show typing indicator immediately
    setTyping(true);

    if (!sessionId) {
      // First message - create a new session
      createSession();
    } else {
      // Subsequent messages - submit as answer
      submitAnswer(sessionId, trimmedValue);
    }
  }, [
    inputValue,
    isTyping,
    isConnected,
    sessionId,
    addMessage,
    setTyping,
    createSession,
    submitAnswer,
  ]);

  // Focus input after sending message
  useEffect(() => {
    if (!isTyping && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isTyping]);

  // Determine placeholder text based on connection status
  const getPlaceholder = (): string => {
    if (connectionStatus === "connecting" || isConnecting) {
      return "Connecting...";
    }
    if (connectionStatus === "disconnected" || connectionStatus === "error") {
      return "Disconnected. Please refresh.";
    }
    if (isTyping) {
      return "Waiting for response...";
    }
    return "Type your answer...";
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{ minHeight: "calc(100vh - var(--header-height))" }}
    >
      {/* Messages Area */}
      <ChatMessageList messages={formattedMessages} isLoading={isTyping} />

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
            disabled={!isConnected || isTyping}
            placeholder={getPlaceholder()}
          />
        </div>
      </div>
    </div>
  );
}
