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
import { AgentService } from './agent.service';
import {
  SessionCreateSchema,
  SessionJoinSchema,
  AnswerSubmitSchema,
  ErrorPayload,
  SessionCreatedPayload,
  SessionJoinedPayload,
  QuestionNewPayload,
  SessionCompletePayload,
} from './dto/websocket.dto';

@WebSocketGateway({
  namespace: '/evaluation',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class EvaluationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server: Server;

  private readonly logger = new Logger(EvaluationGateway.name);

  // Track which session each client is connected to
  private clientSessions = new Map<string, string>(); // socketId -> sessionId

  constructor(private readonly agentService: AgentService) {}

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
      const parseResult = SessionCreateSchema.safeParse(payload ?? {});
      if (!parseResult.success) {
        this.emitError(client, {
          code: 'INVALID_PAYLOAD',
          message: parseResult.error.errors.map((e) => e.message).join(', '),
        });
        return;
      }

      // Create session via AgentService
      const result = await this.agentService.createSession();

      // Associate client with session
      this.clientSessions.set(client.id, result.data.sessionId);

      // Build response payload
      const response: SessionCreatedPayload = {
        sessionId: result.data.sessionId,
        question: result.data.question.text,
        questionNumber: result.data.question.number,
        totalQuestions: result.data.maxQuestions,
        topic: result.data.question.topic,
        difficulty: result.data.question.difficulty,
      };

      // Emit success event
      client.emit('session:created', response);

      this.logger.log(
        `Session created: ${result.data.sessionId} for client: ${client.id}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error creating session: ${errorMessage}`);
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
      let sessionResponse;
      try {
        sessionResponse = this.agentService.getSession(sessionId);
      } catch {
        this.emitError(client, {
          code: 'SESSION_NOT_FOUND',
          message: `Session ${sessionId} not found`,
          sessionId,
        });
        return;
      }

      const session = sessionResponse.data;

      // Associate client with session
      this.clientSessions.set(client.id, sessionId);

      // Build response payload
      const response: SessionJoinedPayload = {
        sessionId: session.sessionId,
        question: session.currentQuestion?.text ?? null,
        questionNumber: session.currentQuestion?.number ?? session.progress.answered,
        totalQuestions: session.maxQuestions,
        topic: session.currentQuestion?.topic ?? 'javascript',
        difficulty: session.currentQuestion?.difficulty ?? 'junior',
        isComplete: session.isComplete,
        history: session.history.map((h) => ({
          question: h.question,
          answer: h.answer ?? '',
        })),
      };

      // Emit success event with full session state
      client.emit('session:joined', response);

      this.logger.log(`Client ${client.id} joined session: ${sessionId}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error joining session: ${errorMessage}`);
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
      let sessionResponse;
      try {
        sessionResponse = this.agentService.getSession(sessionId);
      } catch {
        this.emitError(client, {
          code: 'SESSION_NOT_FOUND',
          message: `Session ${sessionId} not found`,
          sessionId,
        });
        return;
      }

      const session = sessionResponse.data;

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
      if (result.data.isComplete) {
        const completeResponse: SessionCompletePayload = {
          sessionId,
          totalQuestions: result.data.progress.total,
          message:
            result.data.message ||
            'Evaluation completed. Thank you for your responses!',
        };

        client.emit('session:complete', completeResponse);

        this.logger.log(`Session completed: ${sessionId}`);
      } else if (result.data.nextQuestion) {
        // Emit next question
        const questionResponse: QuestionNewPayload = {
          sessionId,
          question: result.data.nextQuestion.text,
          questionNumber: result.data.nextQuestion.number,
          totalQuestions: result.data.progress.total,
          topic: result.data.nextQuestion.topic,
          difficulty: result.data.nextQuestion.difficulty,
        };

        client.emit('question:new', questionResponse);

        this.logger.log(
          `Question ${result.data.nextQuestion.number}/${result.data.progress.total} sent for session: ${sessionId}`,
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error submitting answer: ${errorMessage}`);
      this.emitError(client, {
        code: 'INTERNAL_ERROR',
        message: 'Failed to process answer',
      });
    }
  }

  // ============ Helper Methods ============

  private emitError(client: Socket, error: ErrorPayload): void {
    client.emit('error', error);
    this.logger.warn(
      `Error emitted to client ${client.id}: ${error.code} - ${error.message}`,
    );
  }
}
