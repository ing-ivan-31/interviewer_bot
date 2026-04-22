import { z } from 'zod';

// ============ Input Schemas (Client -> Server) ============

export const SessionCreateSchema = z.object({
  maxQuestions: z.number().min(1).max(50).optional(),
});
export type SessionCreatePayload = z.infer<typeof SessionCreateSchema>;

export const SessionJoinSchema = z.object({
  sessionId: z.string().min(1, 'sessionId is required'),
});
export type SessionJoinPayload = z.infer<typeof SessionJoinSchema>;

export const AnswerSubmitSchema = z.object({
  sessionId: z.string().min(1, 'sessionId is required'),
  answer: z
    .string()
    .min(1, 'Answer is required')
    .max(10000, 'Answer exceeds maximum length'),
});
export type AnswerSubmitPayload = z.infer<typeof AnswerSubmitSchema>;

// ============ Output Interfaces (Server -> Client) ============

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

export type ErrorCode =
  | 'SESSION_NOT_FOUND'
  | 'SESSION_COMPLETE'
  | 'INVALID_PAYLOAD'
  | 'INTERNAL_ERROR';

export interface ErrorPayload {
  code: ErrorCode;
  message: string;
  sessionId?: string;
}
