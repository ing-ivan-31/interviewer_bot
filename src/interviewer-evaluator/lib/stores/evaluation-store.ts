"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface SessionSummary {
  id: string;
  title: string;
  preview: string;
  updatedAt: Date;
}

type SessionStatus = "idle" | "loading" | "active" | "paused" | "completed" | "error";

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

interface EvaluationState {
  // Session
  sessionId: string | null;
  sessionStatus: SessionStatus;

  // Messages
  messages: Message[];
  isLoadingResponse: boolean;

  // WebSocket state
  isTyping: boolean;
  connectionStatus: ConnectionStatus;

  // Sidebar
  sessions: SessionSummary[];

  // UI
  sidebarCollapsed: boolean;

  // Actions
  setSessionId: (id: string | null) => void;
  setSessionStatus: (status: SessionStatus) => void;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  setIsLoadingResponse: (loading: boolean) => void;
  setTyping: (isTyping: boolean) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSessions: (sessions: SessionSummary[]) => void;
  reset: () => void;
}

const initialState = {
  sessionId: null,
  sessionStatus: "idle" as SessionStatus,
  messages: [],
  isLoadingResponse: false,
  isTyping: false,
  connectionStatus: "disconnected" as ConnectionStatus,
  sessions: [],
  sidebarCollapsed: false,
};

export const useEvaluationStore = create<EvaluationState>()(
  persist(
    (set) => ({
      ...initialState,

      setSessionId: (id: string | null): void => {
        set({ sessionId: id });
      },

      setSessionStatus: (status: SessionStatus): void => {
        set({ sessionStatus: status });
      },

      addMessage: (message: Message): void => {
        set((state) => ({
          messages: [...state.messages, message],
        }));
      },

      setMessages: (messages: Message[]): void => {
        set({ messages });
      },

      setIsLoadingResponse: (loading: boolean): void => {
        set({ isLoadingResponse: loading });
      },

      setTyping: (isTyping: boolean): void => {
        set({ isTyping });
      },

      setConnectionStatus: (connectionStatus: ConnectionStatus): void => {
        set({ connectionStatus });
      },

      setSidebarCollapsed: (collapsed: boolean): void => {
        set({ sidebarCollapsed: collapsed });
      },

      setSessions: (sessions: SessionSummary[]): void => {
        set({ sessions });
      },

      reset: (): void => {
        set(initialState);
      },
    }),
    {
      name: "evaluation-storage",
      partialize: (state) => ({
        sessionId: state.sessionId,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
