# WebSocket Chat Connection

**Status:** Done
**Domain:** Frontend
**Created:** 2026-04-21
**Author:** @architect, @frontend

---

## Purpose

Implement a WebSocket client hook and integrate it with the ChatContainer component to enable real-time bidirectional communication with the evaluation backend, displaying a "typing..." indicator while waiting for AI responses.

---

## Dependencies

### npm packages to install

```bash
npm install socket.io-client
```

### Environment Variables

| Variable | Example | Required |
|----------|---------|----------|
| `NEXT_PUBLIC_WS_URL` | `ws://localhost:3001` | Yes |

**Note:** This variable is already documented in CLAUDE.md but may need to be added to `.env.local`.

---

## File Structure

```
src/interviewer-evaluator/
├── lib/
│   ├── hooks/
│   │   └── useEvaluationSocket.ts    # NEW: WebSocket connection hook
│   └── stores/
│       └── evaluation-store.ts       # UPDATE: Add typing state
├── components/
│   └── chat/
│       ├── ChatContainer.tsx         # UPDATE: Integrate WebSocket
│       └── TypingIndicator.tsx       # NEW: Typing animation component
└── .env.local                         # UPDATE: Add NEXT_PUBLIC_WS_URL
```

---

## API Contract

### Hook Interface

```typescript
// useEvaluationSocket.ts

interface UseEvaluationSocketOptions {
  onSessionCreated?: (data: SessionCreatedPayload) => void;
  onSessionJoined?: (data: SessionJoinedPayload) => void;
  onQuestionNew?: (data: QuestionNewPayload) => void;
  onSessionComplete?: (data: SessionCompletePayload) => void;
  onError?: (data: ErrorPayload) => void;
}

interface UseEvaluationSocketReturn {
  isConnected: boolean;
  isConnecting: boolean;
  createSession: (maxQuestions?: number) => void;
  joinSession: (sessionId: string) => void;
  submitAnswer: (sessionId: string, answer: string) => void;
  disconnect: () => void;
}

function useEvaluationSocket(options?: UseEvaluationSocketOptions): UseEvaluationSocketReturn;
```

### Event Payloads (from backend spec)

```typescript
interface SessionCreatedPayload {
  sessionId: string;
  question: string;
  questionNumber: number;
  totalQuestions: number;
  topic: string;
  difficulty: string;
}

interface SessionJoinedPayload {
  sessionId: string;
  question: string | null;
  questionNumber: number;
  totalQuestions: number;
  topic: string;
  difficulty: string;
  isComplete: boolean;
  history: Array<{ question: string; answer: string }>;
}

interface QuestionNewPayload {
  sessionId: string;
  question: string;
  questionNumber: number;
  totalQuestions: number;
  topic: string;
  difficulty: string;
}

interface SessionCompletePayload {
  sessionId: string;
  totalQuestions: number;
  message: string;
}

interface ErrorPayload {
  code: string;
  message: string;
  sessionId?: string;
}
```

---

## Component Specifications

### TypingIndicator Component

```typescript
// TypingIndicator.tsx

interface TypingIndicatorProps {
  className?: string;
}

/**
 * Displays animated typing dots to indicate AI is processing.
 * Uses CSS animation for the bouncing dots effect.
 */
function TypingIndicator({ className }: TypingIndicatorProps): JSX.Element;
```

**Visual Design:**
- Three dots with staggered bounce animation
- Uses muted foreground color from theme
- Appears in same position as incoming messages (left-aligned)
- Wrapped in chat bubble similar to AI messages

---

### Zustand Store Updates

```typescript
// evaluation-store.ts (additions)

interface EvaluationState {
  // Existing fields...

  // NEW fields
  isTyping: boolean;           // Shows typing indicator
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';

  // NEW actions
  setTyping: (isTyping: boolean) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
}
```

---

### ChatContainer Integration

The ChatContainer should:
1. Initialize WebSocket connection on mount
2. Create session when user sends first message (if no active session)
3. Submit answers via WebSocket instead of REST
4. Show TypingIndicator while `isTyping` is true
5. Handle reconnection for existing sessions

**Flow:**

```
User sends message
    ↓
setTyping(true)
    ↓
submitAnswer(sessionId, answer)
    ↓
Wait for question:new or session:complete
    ↓
setTyping(false)
    ↓
Add AI message to messages array
```

---

## Implementation Details

### useEvaluationSocket Hook (Full Implementation)

```typescript
// lib/hooks/useEvaluationSocket.ts
'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

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

const getWebSocketUrl = (): string => {
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
  if (!wsUrl) {
    throw new Error('NEXT_PUBLIC_WS_URL environment variable is required');
  }
  return wsUrl;
};

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
        transports: ['websocket'],
      });

      const socket = socketRef.current;

      // Connection events
      socket.on('connect', () => {
        setIsConnected(true);
        setIsConnecting(false);
        onConnectionChange?.(true);
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
        onConnectionChange?.(false);
      });

      socket.on('connect_error', (error) => {
        setIsConnecting(false);
        setIsConnected(false);
        toast.error('Failed to connect to server');
        console.error('WebSocket connection error:', error);
      });

      // Session events
      socket.on('session:created', (data: SessionCreatedPayload) => {
        onSessionCreated?.(data);
      });

      socket.on('session:joined', (data: SessionJoinedPayload) => {
        onSessionJoined?.(data);
      });

      socket.on('question:new', (data: QuestionNewPayload) => {
        onQuestionNew?.(data);
      });

      socket.on('session:complete', (data: SessionCompletePayload) => {
        onSessionComplete?.(data);
      });

      socket.on('error', (data: ErrorPayload) => {
        onError?.(data);
        toast.error(data.message);
      });

      socket.connect();
    } catch (error) {
      setIsConnecting(false);
      toast.error('Failed to initialize WebSocket connection');
      console.error('WebSocket initialization error:', error);
    }
  }, [onSessionCreated, onSessionJoined, onQuestionNew, onSessionComplete, onError, onConnectionChange]);

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
      toast.error('Not connected to server');
      return;
    }

    socketRef.current.emit('session:create', { maxQuestions });
  }, []);

  // Join an existing session
  const joinSession = useCallback((sessionId: string) => {
    if (!socketRef.current?.connected) {
      toast.error('Not connected to server');
      return;
    }

    socketRef.current.emit('session:join', { sessionId });
  }, []);

  // Submit an answer
  const submitAnswer = useCallback((sessionId: string, answer: string) => {
    if (!socketRef.current?.connected) {
      toast.error('Not connected to server');
      return;
    }

    socketRef.current.emit('answer:submit', { sessionId, answer });
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
```

---

### TypingIndicator Component (Full Implementation)

```typescript
// components/chat/TypingIndicator.tsx
'use client';

import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  className?: string;
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-1 px-4 py-3', className)}>
      <div className="flex items-center gap-1">
        <span
          className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce"
          style={{ animationDelay: '0ms', animationDuration: '1.4s' }}
        />
        <span
          className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce"
          style={{ animationDelay: '200ms', animationDuration: '1.4s' }}
        />
        <span
          className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce"
          style={{ animationDelay: '400ms', animationDuration: '1.4s' }}
        />
      </div>
    </div>
  );
}
```

---

### Zustand Store Updates (Full Implementation)

```typescript
// lib/stores/evaluation-store.ts
// ADD these fields and actions to the existing store

import { create } from 'zustand';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface EvaluationState {
  // ... existing fields ...

  // NEW: WebSocket related state
  isTyping: boolean;
  connectionStatus: ConnectionStatus;

  // NEW: WebSocket related actions
  setTyping: (isTyping: boolean) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
}

// Add to the store creator:
export const useEvaluationStore = create<EvaluationState>((set, get) => ({
  // ... existing state and actions ...

  // NEW: WebSocket state
  isTyping: false,
  connectionStatus: 'disconnected',

  // NEW: WebSocket actions
  setTyping: (isTyping) => set({ isTyping }),
  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
}));
```

---

### ChatContainer Integration (Usage Example)

```typescript
// components/chat/ChatContainer.tsx
'use client';

import { useEffect, useCallback } from 'react';
import { useEvaluationStore } from '@/lib/stores/evaluation-store';
import { useEvaluationSocket } from '@/lib/hooks/useEvaluationSocket';
import { TypingIndicator } from './TypingIndicator';
// ... other imports

export function ChatContainer() {
  const {
    sessionId,
    messages,
    isTyping,
    addMessage,
    setSessionId,
    setTyping,
    setConnectionStatus,
  } = useEvaluationStore();

  // Initialize WebSocket hook with callbacks
  const {
    isConnected,
    isConnecting,
    connect,
    createSession,
    joinSession,
    submitAnswer,
  } = useEvaluationSocket({
    onSessionCreated: (data) => {
      setSessionId(data.sessionId);
      setTyping(false);
      addMessage({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.question,
        timestamp: new Date(),
      });
    },
    onQuestionNew: (data) => {
      setTyping(false);
      addMessage({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.question,
        timestamp: new Date(),
      });
    },
    onSessionComplete: (data) => {
      setTyping(false);
      addMessage({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      });
    },
    onError: () => {
      setTyping(false);
    },
    onConnectionChange: (connected) => {
      setConnectionStatus(connected ? 'connected' : 'disconnected');
    },
  });

  // Connect on mount
  useEffect(() => {
    connect();
  }, [connect]);

  // Handle sending a message
  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!isConnected) {
        return;
      }

      // Add user message to UI
      addMessage({
        id: crypto.randomUUID(),
        role: 'user',
        content,
        timestamp: new Date(),
      });

      // Show typing indicator immediately
      setTyping(true);

      if (!sessionId) {
        // First message - create a new session
        createSession();
      } else {
        // Subsequent messages - submit as answer
        submitAnswer(sessionId, content);
      }
    },
    [isConnected, sessionId, addMessage, setTyping, createSession, submitAnswer]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}

        {/* Typing indicator - shows when waiting for AI response */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg max-w-[80%]">
              <TypingIndicator />
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <ChatInput
        onSend={handleSendMessage}
        disabled={!isConnected || isTyping}
        placeholder={
          !isConnected
            ? 'Connecting...'
            : isTyping
            ? 'Waiting for response...'
            : 'Type your answer...'
        }
      />
    </div>
  );
}
```

---

### Tailwind Animation (add to globals.css or tailwind.config.js)

```css
/* globals.css - add custom bounce animation if default doesn't look right */
@keyframes typing-bounce {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-4px);
  }
}

/* Alternative: use in TypingIndicator with arbitrary animation */
.animate-typing-dot {
  animation: typing-bounce 1.4s infinite ease-in-out;
}
```

Or configure in `tailwind.config.js`:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      animation: {
        'typing-bounce': 'typing-bounce 1.4s infinite ease-in-out',
      },
      keyframes: {
        'typing-bounce': {
          '0%, 60%, 100%': { transform: 'translateY(0)' },
          '30%': { transform: 'translateY(-4px)' },
        },
      },
    },
  },
};
```

---

## Invariants

1. WebSocket URL MUST be read from `NEXT_PUBLIC_WS_URL` environment variable
2. Never hardcode WebSocket URLs in source code
3. Typing indicator MUST show immediately when user sends a message
4. Typing indicator MUST hide when response is received (success or error)
5. Hook MUST clean up socket connection on unmount
6. Connection errors MUST be surfaced to the user via toast or error state

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| `NEXT_PUBLIC_WS_URL` not set | Throw error with clear message on hook initialization |
| Connection fails | Show toast error, update `connectionStatus` to 'error' |
| Connection drops mid-session | Update status, allow retry via reconnect |
| User sends message while disconnected | Show error toast, do not set typing |
| Server emits error event | Hide typing indicator, show error toast |
| User navigates away during request | Clean up socket, no memory leaks |
| User refreshes page with active session | Can rejoin using stored sessionId |

---

## Acceptance Criteria

- [ ] **AC1:** `useEvaluationSocket` hook connects to WebSocket using `NEXT_PUBLIC_WS_URL` env variable
- [ ] **AC2:** No WebSocket URLs are hardcoded in the source code
- [ ] **AC3:** Typing indicator appears immediately when user sends a message
- [ ] **AC4:** Typing indicator disappears when AI response is received
- [ ] **AC5:** Typing indicator disappears on error
- [ ] **AC6:** TypingIndicator component displays animated bouncing dots
- [ ] **AC7:** ChatContainer uses WebSocket instead of REST/setTimeout for responses
- [ ] **AC8:** Connection status is tracked in Zustand store
- [ ] **AC9:** Socket connection is cleaned up on component unmount
- [ ] **AC10:** Error events display user-friendly toast notifications

---

## Test Cases

### Unit Tests

| Test | Maps to AC |
|------|------------|
| `useEvaluationSocket reads URL from NEXT_PUBLIC_WS_URL` | AC1, AC2 |
| `useEvaluationSocket throws if env variable missing` | AC1 |
| `submitAnswer triggers isTyping in store` | AC3 |
| `onQuestionNew callback hides typing indicator` | AC4 |
| `onError callback hides typing indicator` | AC5 |
| `TypingIndicator renders three animated dots` | AC6 |
| `ChatContainer calls submitAnswer on user message` | AC7 |
| `connection status updates on connect/disconnect` | AC8 |
| `socket.disconnect called on unmount` | AC9 |

### Integration Tests

| Test | Maps to AC |
|------|------------|
| `full flow: send message → typing → receive response` | AC3, AC4, AC7 |
| `error flow: send message → typing → error → no typing` | AC5, AC10 |

---

## Out of Scope

- JWT/token authentication on connect
- Token-by-token streaming display
- Automatic session recovery on page refresh
- Offline message queue
- Connection quality indicators
- Sound notifications

---

## Implementation Order

1. Add `NEXT_PUBLIC_WS_URL` to `.env.local`
2. Install `socket.io-client`
3. Create `useEvaluationSocket.ts` hook
4. Create `TypingIndicator.tsx` component
5. Update `evaluation-store.ts` with typing state
6. Integrate hook in `ChatContainer.tsx`
7. Write unit tests
8. Manual end-to-end testing

---

## Agents Required

| Agent | Task |
|-------|------|
| `@frontend` | Implement hook, component, store updates, integration |
