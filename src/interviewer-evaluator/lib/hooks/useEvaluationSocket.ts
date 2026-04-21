"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";

// ============ Types ============

export interface SessionCreatedPayload {
  sessionId: string;
  question: string;
  questionNumber: number;
  totalQuestions: number;
  topic: string;
  difficulty: string;
}

export interface SessionJoinedPayload {
  sessionId: string;
  question: string | null;
  questionNumber: number;
  totalQuestions: number;
  topic: string;
  difficulty: string;
  isComplete: boolean;
  history: Array<{ question: string; answer: string }>;
}

export interface QuestionNewPayload {
  sessionId: string;
  question: string;
  questionNumber: number;
  totalQuestions: number;
  topic: string;
  difficulty: string;
}

export interface SessionCompletePayload {
  sessionId: string;
  totalQuestions: number;
  message: string;
}

export interface ErrorPayload {
  code: string;
  message: string;
  sessionId?: string;
}

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
  joinSession: (sessionId: string) => void;
  submitAnswer: (sessionId: string, answer: string) => void;
}

// ============ Helper Functions ============

function getWebSocketUrl(): string {
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
  if (!wsUrl) {
    throw new Error("NEXT_PUBLIC_WS_URL environment variable is required");
  }
  return wsUrl;
}

// ============ Hook Implementation ============

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

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Store callbacks in refs to avoid re-creating socket on callback changes
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

  // Initialize socket connection
  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }

    setIsConnecting(true);

    try {
      const wsUrl = getWebSocketUrl();

      socketRef.current = io(`${wsUrl}/evaluation`, {
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
        transports: ["websocket"],
      });

      const socket = socketRef.current;

      // Connection events
      socket.on("connect", () => {
        setIsConnected(true);
        setIsConnecting(false);
        callbacksRef.current.onConnectionChange?.(true);
      });

      socket.on("disconnect", () => {
        setIsConnected(false);
        callbacksRef.current.onConnectionChange?.(false);
      });

      socket.on("connect_error", (error: Error) => {
        setIsConnecting(false);
        setIsConnected(false);
        console.error("WebSocket connection error:", error);
        callbacksRef.current.onError?.({
          code: "CONNECTION_ERROR",
          message: "Failed to connect to server",
        });
      });

      // Session events
      socket.on("session:created", (data: SessionCreatedPayload) => {
        callbacksRef.current.onSessionCreated?.(data);
      });

      socket.on("session:joined", (data: SessionJoinedPayload) => {
        callbacksRef.current.onSessionJoined?.(data);
      });

      socket.on("question:new", (data: QuestionNewPayload) => {
        callbacksRef.current.onQuestionNew?.(data);
      });

      socket.on("session:complete", (data: SessionCompletePayload) => {
        callbacksRef.current.onSessionComplete?.(data);
      });

      socket.on("error", (data: ErrorPayload) => {
        callbacksRef.current.onError?.(data);
      });

      socket.connect();
    } catch (error) {
      setIsConnecting(false);
      console.error("WebSocket initialization error:", error);
      callbacksRef.current.onError?.({
        code: "INIT_ERROR",
        message: "Failed to initialize WebSocket connection",
      });
    }
  }, []);

  // Disconnect socket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Create a new session
  const createSession = useCallback((maxQuestions?: number) => {
    if (!socketRef.current?.connected) {
      callbacksRef.current.onError?.({
        code: "NOT_CONNECTED",
        message: "Not connected to server",
      });
      return;
    }

    socketRef.current.emit("session:create", { maxQuestions });
  }, []);

  // Join an existing session
  const joinSession = useCallback((sessionId: string) => {
    if (!socketRef.current?.connected) {
      callbacksRef.current.onError?.({
        code: "NOT_CONNECTED",
        message: "Not connected to server",
      });
      return;
    }

    socketRef.current.emit("session:join", { sessionId });
  }, []);

  // Submit an answer
  const submitAnswer = useCallback((sessionId: string, answer: string) => {
    if (!socketRef.current?.connected) {
      callbacksRef.current.onError?.({
        code: "NOT_CONNECTED",
        message: "Not connected to server",
      });
      return;
    }

    socketRef.current.emit("answer:submit", { sessionId, answer });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    createSession,
    joinSession,
    submitAnswer,
  };
}
