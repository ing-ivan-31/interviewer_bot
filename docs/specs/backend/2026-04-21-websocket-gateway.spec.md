# WebSocket Gateway for Chat Sessions

**Status:** Approved
**Domain:** Backend
**Created:** 2026-04-21
**Author:** @architect, @backend

---

## Purpose

Implement a NestJS WebSocket gateway that enables real-time bidirectional communication between the frontend chat UI and the LangGraph evaluation agent, replacing REST polling with persistent WebSocket connections.

---

## Dependencies

### npm packages to install

```bash
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
```

### Environment Variables

| Variable | Example | Description |
|----------|---------|-------------|
| `FRONTEND_URL` | `http://localhost:3000` | CORS origin for WebSocket connections |
| `WS_PORT` | `3001` | WebSocket server port (shares with HTTP) |

**Note:** No new env vars required - reuses existing `FRONTEND_URL` and `PORT`.

---

## API Contract

### Connection

```
URL: ws://{host}:{port}/evaluation
Transport: WebSocket (Socket.IO)
Namespace: /evaluation
```

### Events (Client → Server)

#### `session:create`

Creates a new evaluation session and returns the first question.

**Payload:**
```typescript
interface SessionCreatePayload {
  maxQuestions?: number; // Optional, defaults to env MAX_QUESTIONS_PER_SESSION
}
```

**Response Event:** `session:created`

---

#### `session:join`

Joins an existing session (for reconnection).

**Payload:**
```typescript
interface SessionJoinPayload {
  sessionId: string;
}
```

**Response Event:** `session:joined` or `error`

---

#### `answer:submit`

Submits a candidate's answer and receives the next question.

**Payload:**
```typescript
interface AnswerSubmitPayload {
  sessionId: string;
  answer: string;
}
```

**Response Event:** `question:new` or `session:complete`

---

### Events (Server → Client)

#### `session:created`

Emitted after successful session creation.

**Payload:**
```typescript
interface SessionCreatedPayload {
  sessionId: string;
  question: string;
  questionNumber: number;
  totalQuestions: number;
  topic: string;
  difficulty: string;
}
```

---

#### `session:joined`

Emitted after successfully joining an existing session.

**Payload:**
```typescript
interface SessionJoinedPayload {
  sessionId: string;
  question: string | null; // null if session is complete
  questionNumber: number;
  totalQuestions: number;
  topic: string;
  difficulty: string;
  isComplete: boolean;
  history: Array<{
    question: string;
    answer: string;
  }>;
}
```

---

#### `question:new`

Emitted after processing an answer with the next question.

**Payload:**
```typescript
interface QuestionNewPayload {
  sessionId: string;
  question: string;
  questionNumber: number;
  totalQuestions: number;
  topic: string;
  difficulty: string;
}
```

---

#### `session:complete`

Emitted when all questions have been answered.

**Payload:**
```typescript
interface SessionCompletePayload {
  sessionId: string;
  totalQuestions: number;
  message: string;
}
```

---

#### `error`

Emitted when an error occurs.

**Payload:**
```typescript
interface ErrorPayload {
  code: string;
  message: string;
  sessionId?: string;
}
```

**Error Codes:**
| Code | Description |
|------|-------------|
| `SESSION_NOT_FOUND` | Session ID does not exist |
| `SESSION_COMPLETE` | Cannot submit answer to completed session |
| `INVALID_PAYLOAD` | Malformed request payload |
| `INTERNAL_ERROR` | Unexpected server error |

---

## File Structure

```
src/interviewer-evaluator-api/src/
├── modules/
│   └── agent/
│       ├── agent.module.ts           # Update: import gateway
│       ├── evaluation.gateway.ts     # NEW: WebSocket gateway
│       ├── evaluation.gateway.spec.ts # NEW: Unit tests
│       └── dto/
│           └── websocket.dto.ts      # NEW: Zod schemas for payloads
```

---

## Implementation Details

### Zod Validation Schemas

```typescript
// dto/websocket.dto.ts
import { z } from 'zod';

// ============ Input Schemas (Client → Server) ============

export const SessionCreateSchema = z.object({
  maxQuestions: z.number().min(1).max(50).optional(),
});
export type SessionCreatePayload = z.infer<typeof SessionCreateSchema>;

export const SessionJoinSchema = z.object({
  sessionId: z.string().uuid(),
});
export type SessionJoinPayload = z.infer<typeof SessionJoinSchema>;

export const AnswerSubmitSchema = z.object({
  sessionId: z.string().uuid(),
  answer: z.string().min(1).max(10000),
});
export type AnswerSubmitPayload = z.infer<typeof AnswerSubmitSchema>;

// ============ Output Schemas (Server → Client) ============

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
  code: 'SESSION_NOT_FOUND' | 'SESSION_COMPLETE' | 'INVALID_PAYLOAD' | 'INTERNAL_ERROR';
  message: string;
  sessionId?: string;
}
```

---

### Gateway Class (Full Implementation)

```typescript
// evaluation.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AgentService } from './agent.service';
import {
  SessionCreateSchema,
  SessionCreatePayload,
  SessionJoinSchema,
  SessionJoinPayload,
  AnswerSubmitSchema,
  AnswerSubmitPayload,
  ErrorPayload,
} from './dto/websocket.dto';

@WebSocketGateway({
  namespace: '/evaluation',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class EvaluationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;

  private readonly logger = new Logger(EvaluationGateway.name);

  // Track which session each client is connected to
  private clientSessions = new Map<string, string>(); // socketId -> sessionId

  constructor(
    private readonly agentService: AgentService,
    private readonly configService: ConfigService,
  ) {}

  // ============ Connection Lifecycle ============

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Clean up client-session mapping, but keep session in store for reconnection
    this.clientSessions.delete(client.id);
  }

  // ============ Event Handlers ============

  @SubscribeMessage('session:create')
  async handleSessionCreate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: unknown,
  ): Promise<void> {
    try {
      // Validate payload
      const parseResult = SessionCreateSchema.safeParse(payload);
      if (!parseResult.success) {
        this.emitError(client, {
          code: 'INVALID_PAYLOAD',
          message: parseResult.error.errors.map((e) => e.message).join(', '),
        });
        return;
      }

      const { maxQuestions } = parseResult.data;

      // Create session via AgentService
      const result = await this.agentService.createSession(maxQuestions);

      // Associate client with session
      this.clientSessions.set(client.id, result.sessionId);

      // Emit success event
      client.emit('session:created', {
        sessionId: result.sessionId,
        question: result.question,
        questionNumber: result.questionNumber,
        totalQuestions: result.maxQuestions,
        topic: result.topic,
        difficulty: result.difficulty,
      });

      this.logger.log(`Session created: ${result.sessionId} for client: ${client.id}`);
    } catch (error) {
      this.logger.error(`Error creating session: ${error.message}`, error.stack);
      this.emitError(client, {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create session',
      });
    }
  }

  @SubscribeMessage('session:join')
  async handleSessionJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: unknown,
  ): Promise<void> {
    try {
      // Validate payload
      const parseResult = SessionJoinSchema.safeParse(payload);
      if (!parseResult.success) {
        this.emitError(client, {
          code: 'INVALID_PAYLOAD',
          message: parseResult.error.errors.map((e) => e.message).join(', '),
        });
        return;
      }

      const { sessionId } = parseResult.data;

      // Get session from AgentService
      const session = await this.agentService.getSession(sessionId);

      if (!session) {
        this.emitError(client, {
          code: 'SESSION_NOT_FOUND',
          message: `Session ${sessionId} not found`,
          sessionId,
        });
        return;
      }

      // Associate client with session
      this.clientSessions.set(client.id, sessionId);

      // Emit success event with full session state
      client.emit('session:joined', {
        sessionId: session.id,
        question: session.currentQuestion,
        questionNumber: session.currentQuestionNumber,
        totalQuestions: session.maxQuestions,
        topic: session.currentTopic,
        difficulty: session.currentDifficulty,
        isComplete: session.isComplete,
        history: session.history.map((h) => ({
          question: h.question,
          answer: h.answer,
        })),
      });

      this.logger.log(`Client ${client.id} joined session: ${sessionId}`);
    } catch (error) {
      this.logger.error(`Error joining session: ${error.message}`, error.stack);
      this.emitError(client, {
        code: 'INTERNAL_ERROR',
        message: 'Failed to join session',
      });
    }
  }

  @SubscribeMessage('answer:submit')
  async handleAnswerSubmit(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: unknown,
  ): Promise<void> {
    try {
      // Validate payload
      const parseResult = AnswerSubmitSchema.safeParse(payload);
      if (!parseResult.success) {
        this.emitError(client, {
          code: 'INVALID_PAYLOAD',
          message: parseResult.error.errors.map((e) => e.message).join(', '),
        });
        return;
      }

      const { sessionId, answer } = parseResult.data;

      // Get session to check state
      const session = await this.agentService.getSession(sessionId);

      if (!session) {
        this.emitError(client, {
          code: 'SESSION_NOT_FOUND',
          message: `Session ${sessionId} not found`,
          sessionId,
        });
        return;
      }

      if (session.isComplete) {
        this.emitError(client, {
          code: 'SESSION_COMPLETE',
          message: 'Cannot submit answer to completed session',
          sessionId,
        });
        return;
      }

      // Submit answer via AgentService
      const result = await this.agentService.submitAnswer(sessionId, answer);

      // Check if session is now complete
      if (result.isComplete) {
        client.emit('session:complete', {
          sessionId,
          totalQuestions: result.currentQuestionNumber,
          message: 'Evaluation completed. Thank you for your responses!',
        });

        this.logger.log(`Session completed: ${sessionId}`);
      } else {
        // Emit next question
        client.emit('question:new', {
          sessionId,
          question: result.question,
          questionNumber: result.currentQuestionNumber,
          totalQuestions: result.maxQuestions,
          topic: result.topic,
          difficulty: result.difficulty,
        });

        this.logger.log(
          `Question ${result.currentQuestionNumber}/${result.maxQuestions} sent for session: ${sessionId}`,
        );
      }
    } catch (error) {
      this.logger.error(`Error submitting answer: ${error.message}`, error.stack);
      this.emitError(client, {
        code: 'INTERNAL_ERROR',
        message: 'Failed to process answer',
      });
    }
  }

  // ============ Helper Methods ============

  private emitError(client: Socket, error: ErrorPayload): void {
    client.emit('error', error);
    this.logger.warn(`Error emitted to client ${client.id}: ${error.code} - ${error.message}`);
  }
}
```

---

### Module Update

```typescript
// agent.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AgentService } from './agent.service';
import { AgentController } from './agent.controller';
import { SessionStore } from './session.store';
import { EvaluationGateway } from './evaluation.gateway'; // ADD THIS

@Module({
  imports: [ConfigModule],
  controllers: [AgentController],
  providers: [
    AgentService,
    SessionStore,
    EvaluationGateway, // ADD THIS
  ],
  exports: [AgentService],
})
export class AgentModule {}
```

---

## Invariants

1. Each client socket can be associated with at most one session at a time
2. All payloads MUST be validated with Zod before processing
3. Errors MUST emit `error` event, never throw unhandled exceptions
4. Session state MUST remain consistent between REST and WebSocket operations
5. CORS origin MUST be read from `FRONTEND_URL` environment variable

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Client disconnects mid-evaluation | Session remains in store, can be rejoined |
| Client sends answer after session complete | Emit `error` with `SESSION_COMPLETE` |
| Client joins non-existent session | Emit `error` with `SESSION_NOT_FOUND` |
| Malformed payload | Emit `error` with `INVALID_PAYLOAD` and validation details |
| LLM service timeout | Emit `error` with `INTERNAL_ERROR` |
| Client creates session while already in one | New session replaces old association |

---

## Acceptance Criteria

- [ ] **AC1:** WebSocket gateway accepts connections at `/evaluation` namespace
- [ ] **AC2:** `session:create` creates a session and emits `session:created` with first question
- [ ] **AC3:** `session:join` allows reconnection to existing session with full history
- [ ] **AC4:** `answer:submit` processes answer via AgentService and emits `question:new`
- [ ] **AC5:** After final question, `answer:submit` emits `session:complete`
- [ ] **AC6:** All error conditions emit `error` event with appropriate code
- [ ] **AC7:** CORS origin is configured from `FRONTEND_URL` env variable
- [ ] **AC8:** All incoming payloads are validated with Zod schemas
- [ ] **AC9:** Gateway integrates with existing AgentService without duplication
- [ ] **AC10:** Unit tests cover all event handlers and error cases

---

## Test Cases

### Unit Tests (`evaluation.gateway.spec.ts`)

| Test | Maps to AC |
|------|------------|
| `should accept WebSocket connections on /evaluation namespace` | AC1 |
| `should create session and emit session:created with question` | AC2 |
| `should join existing session and return history` | AC3 |
| `should emit error when joining non-existent session` | AC3, AC6 |
| `should process answer and emit question:new` | AC4 |
| `should emit session:complete after final question` | AC5 |
| `should emit error for malformed payloads` | AC6, AC8 |
| `should emit error when submitting to completed session` | AC6 |
| `should validate all payloads with Zod` | AC8 |
| `should use AgentService for all session operations` | AC9 |

---

## Out of Scope

- JWT/token authentication (separate spec)
- Token streaming from LLM
- Automatic reconnection handling (client responsibility)
- Session persistence to database (uses existing in-memory store)
- Rate limiting
- Multiple concurrent sessions per client

---

## Implementation Order

1. Install npm dependencies
2. Create `dto/websocket.dto.ts` with Zod schemas
3. Create `evaluation.gateway.ts` with all event handlers
4. Update `agent.module.ts` to import gateway
5. Write unit tests
6. Manual testing with Socket.IO client

---

## Agents Required

| Agent | Task |
|-------|------|
| `@backend` | Implement gateway, DTOs, tests |
