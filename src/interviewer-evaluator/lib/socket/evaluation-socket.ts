"use client";

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

// ============ Singleton Socket ============

let socket: Socket | null = null;
let connectionPromise: Promise<void> | null = null;

function getWebSocketUrl(): string {
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
  if (!wsUrl) {
    throw new Error("NEXT_PUBLIC_WS_URL environment variable is required");
  }
  return wsUrl;
}

/**
 * Get or create the singleton socket instance.
 * The socket survives React component remounts (including StrictMode).
 */
export function getSocket(): Socket {
  if (!socket) {
    const wsUrl = getWebSocketUrl();
    socket = io(`${wsUrl}/evaluation`, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ["websocket"],
    });
  }
  return socket;
}

/**
 * Connect the socket if not already connected.
 * Returns a promise that resolves when connected.
 */
export function connectSocket(): Promise<void> {
  const s = getSocket();

  if (s.connected) {
    return Promise.resolve();
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = new Promise<void>((resolve, reject) => {
    const onConnect = () => {
      cleanup();
      resolve();
    };

    const onError = (error: Error) => {
      cleanup();
      reject(error);
    };

    const cleanup = () => {
      s.off("connect", onConnect);
      s.off("connect_error", onError);
      connectionPromise = null;
    };

    s.once("connect", onConnect);
    s.once("connect_error", onError);
    s.connect();
  });

  return connectionPromise;
}

/**
 * Disconnect and destroy the socket instance.
 * Only call this when the app is truly shutting down.
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    connectionPromise = null;
  }
}

/**
 * Check if socket is currently connected.
 */
export function isSocketConnected(): boolean {
  return socket?.connected ?? false;
}

/**
 * Emit an event on the socket.
 */
export function emitEvent<T>(event: string, data?: T): void {
  const s = getSocket();
  if (!s.connected) {
    console.warn(`Socket not connected, cannot emit ${event}`);
    return;
  }
  s.emit(event, data);
}
