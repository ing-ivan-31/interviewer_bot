"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import {
  getSocket,
  connectSocket,
  isSocketConnected,
  emitEvent,
  type SessionCreatedPayload,
  type SessionJoinedPayload,
  type QuestionNewPayload,
  type SessionCompletePayload,
  type ErrorPayload,
} from "@/lib/socket/evaluation-socket";

// Re-export types for convenience
export type {
  SessionCreatedPayload,
  SessionJoinedPayload,
  QuestionNewPayload,
  SessionCompletePayload,
  ErrorPayload,
};

export interface UseEvaluationSocketOptions {
  onSessionCreated?: (data: SessionCreatedPayload) => void;
  onSessionJoined?: (data: SessionJoinedPayload) => void;
  onQuestionNew?: (data: QuestionNewPayload) => void;
  onSessionComplete?: (data: SessionCompletePayload) => void;
  onError?: (data: ErrorPayload) => void;
  onConnectionChange?: (isConnected: boolean) => void;
}

export interface UseEvaluationSocketReturn {
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => void;
  disconnect: () => void;
  createSession: (maxQuestions?: number) => void;
  submitAnswer: (sessionId: string, answer: string) => void;
}

export function useEvaluationSocket(
  options: UseEvaluationSocketOptions = {}
): UseEvaluationSocketReturn {
  const {
    onSessionCreated,
    onSessionJoined,
    onQuestionNew,
    onSessionComplete,
    onError,
    onConnectionChange,
  } = options;

  const [isConnected, setIsConnected] = useState(() => isSocketConnected());
  const [isConnecting, setIsConnecting] = useState(false);
  const mountedRef = useRef(true);

  // Store callbacks in refs to avoid re-registering listeners on callback changes
  const callbacksRef = useRef({
    onSessionCreated,
    onSessionJoined,
    onQuestionNew,
    onSessionComplete,
    onError,
    onConnectionChange,
  });

  // Update refs when callbacks change
  useEffect(() => {
    callbacksRef.current = {
      onSessionCreated,
      onSessionJoined,
      onQuestionNew,
      onSessionComplete,
      onError,
      onConnectionChange,
    };
  }, [
    onSessionCreated,
    onSessionJoined,
    onQuestionNew,
    onSessionComplete,
    onError,
    onConnectionChange,
  ]);

  // Register event listeners on mount, unregister on unmount
  useEffect(() => {
    mountedRef.current = true;
    const socket = getSocket();

    // Event handlers that use refs for latest callbacks
    const handleConnect = () => {
      if (!mountedRef.current) return;
      setIsConnected(true);
      setIsConnecting(false);
      callbacksRef.current.onConnectionChange?.(true);
    };

    const handleDisconnect = () => {
      if (!mountedRef.current) return;
      setIsConnected(false);
      callbacksRef.current.onConnectionChange?.(false);
    };

    const handleConnectError = (error: Error) => {
      if (!mountedRef.current) return;
      setIsConnecting(false);
      setIsConnected(false);
      console.error("WebSocket connection error:", error);
      callbacksRef.current.onError?.({
        code: "CONNECTION_ERROR",
        message: "Failed to connect to server",
      });
    };

    const handleSessionCreated = (data: SessionCreatedPayload) => {
      if (!mountedRef.current) return;
      callbacksRef.current.onSessionCreated?.(data);
    };

    const handleSessionJoined = (data: SessionJoinedPayload) => {
      if (!mountedRef.current) return;
      callbacksRef.current.onSessionJoined?.(data);
    };

    const handleQuestionNew = (data: QuestionNewPayload) => {
      if (!mountedRef.current) return;
      callbacksRef.current.onQuestionNew?.(data);
    };

    const handleSessionComplete = (data: SessionCompletePayload) => {
      if (!mountedRef.current) return;
      callbacksRef.current.onSessionComplete?.(data);
    };

    const handleError = (data: ErrorPayload) => {
      if (!mountedRef.current) return;
      callbacksRef.current.onError?.(data);
    };

    // Register listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("session:created", handleSessionCreated);
    socket.on("session:joined", handleSessionJoined);
    socket.on("question:new", handleQuestionNew);
    socket.on("session:complete", handleSessionComplete);
    socket.on("error", handleError);

    // If socket is already connected, notify callback
    if (socket.connected) {
      callbacksRef.current.onConnectionChange?.(true);
    }

    // Cleanup: only remove THIS component's listeners, don't disconnect socket
    return () => {
      mountedRef.current = false;
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("session:created", handleSessionCreated);
      socket.off("session:joined", handleSessionJoined);
      socket.off("question:new", handleQuestionNew);
      socket.off("session:complete", handleSessionComplete);
      socket.off("error", handleError);
    };
  }, []);

  // Connect to socket
  const connect = useCallback(() => {
    if (isSocketConnected()) {
      setIsConnected(true);
      return;
    }

    setIsConnecting(true);

    connectSocket()
      .then(() => {
        if (mountedRef.current) {
          setIsConnected(true);
          setIsConnecting(false);
        }
      })
      .catch((error) => {
        if (mountedRef.current) {
          setIsConnecting(false);
          console.error("Failed to connect:", error);
        }
      });
  }, []);

  // Disconnect (rarely needed - socket is singleton)
  const disconnect = useCallback(() => {
    // Don't actually disconnect the singleton - just update local state
    setIsConnected(false);
  }, []);

  // Create a new session
  const createSession = useCallback((maxQuestions?: number) => {
    if (!isSocketConnected()) {
      callbacksRef.current.onError?.({
        code: "NOT_CONNECTED",
        message: "Not connected to server",
      });
      return;
    }

    emitEvent("session:create", { maxQuestions });
  }, []);

  // Submit an answer
  const submitAnswer = useCallback((sessionId: string, answer: string) => {
    if (!isSocketConnected()) {
      callbacksRef.current.onError?.({
        code: "NOT_CONNECTED",
        message: "Not connected to server",
      });
      return;
    }

    emitEvent("answer:submit", { sessionId, answer });
  }, []);

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    createSession,
    submitAnswer,
  };
}
