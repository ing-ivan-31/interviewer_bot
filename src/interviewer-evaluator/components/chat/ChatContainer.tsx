"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ChatMessageList, type Message } from "./ChatMessageList";
import { ChatInput } from "@/components/layout/ChatInput";
import { useEvaluationStore } from "@/lib/stores/evaluation-store";
import { useEvaluationSocket } from "@/lib/hooks/useEvaluationSocket";

const WELCOME_MESSAGE =
  "Welcome to the Interviewer Evaluator. You will be asked questions about JavaScript and React. Please answer each question to the best of your ability. Reply with \"I understand\" to begin.";

const WELCOME_MESSAGE_ID = "msg-welcome";

export function ChatContainer(): React.ReactNode {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    sessionId,
    messages,
    isTyping,
    connectionStatus,
    welcomeMessageShown,
    addMessage,
    setMessages,
    setSessionId,
    setTyping,
    setConnectionStatus,
    setWelcomeMessageShown,
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
      onError: (data) => {
        setTyping(false);
        console.error("WebSocket error:", data.code, data.message);
        if (data.code === "SESSION_NOT_FOUND") {
          setSessionId(null);
          setMessages([]);
        }
      },
      onConnectionChange: (connected) => {
        setConnectionStatus(connected ? "connected" : "disconnected");
      },
    });

  // Connect on mount
  useEffect(() => {
    connect();
  }, [connect]);

  // Add welcome message when connected (using store state, not ref)
  useEffect(() => {
    if (isConnected && !welcomeMessageShown) {
      setWelcomeMessageShown(true);
      addMessage({
        id: WELCOME_MESSAGE_ID,
        role: "assistant",
        content: WELCOME_MESSAGE,
        timestamp: new Date(),
      });
    }
  }, [isConnected, welcomeMessageShown, setWelcomeMessageShown, addMessage]);

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

    const isFirstUserMessage =
      messages.filter((m) => m.role === "user").length === 0;

    addMessage({
      id: `msg-${Date.now()}-user`,
      role: "user" as const,
      content: trimmedValue,
      timestamp: new Date(),
    });
    setInputValue("");

    setTyping(true);

    if (isFirstUserMessage) {
      createSession();
    } else {
      submitAnswer(sessionId!, trimmedValue);
    }
  }, [
    inputValue,
    isTyping,
    isConnected,
    sessionId,
    messages,
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
      <ChatMessageList messages={formattedMessages} isLoading={isTyping} />

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
