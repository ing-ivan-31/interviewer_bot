import { Topic, Difficulty, QuestionAnswer } from '../graph/state';

export interface QuestionInfo {
  number: number;
  topic: Topic;
  difficulty: Difficulty;
  text: string;
}

export interface ProgressInfo {
  answered: number;
  total: number;
}

export interface AnsweredQuestionInfo {
  number: number;
  topic: Topic;
  difficulty: Difficulty;
}

export interface HistoryEntry {
  number: number;
  topic: Topic;
  difficulty: Difficulty;
  question: string;
  answer: string | null;
  answeredAt: string | null;
}

/**
 * Response for POST /agent/sessions
 */
export interface CreateSessionResponse {
  data: {
    sessionId: string;
    maxQuestions: number;
    question: QuestionInfo;
    isComplete: boolean;
  };
}

/**
 * Response for POST /agent/sessions/:id/answer (next question)
 */
export interface SubmitAnswerResponse {
  data: {
    sessionId: string;
    answeredQuestion: AnsweredQuestionInfo;
    nextQuestion: QuestionInfo | null;
    progress: ProgressInfo;
    isComplete: boolean;
    message?: string;
  };
}

/**
 * Response for GET /agent/sessions/:id
 */
export interface GetSessionResponse {
  data: {
    sessionId: string;
    maxQuestions: number;
    progress: ProgressInfo;
    currentQuestion: QuestionInfo | null;
    history: HistoryEntry[];
    isComplete: boolean;
    createdAt: string;
  };
}

/**
 * Response for DELETE /agent/sessions/:id
 */
export interface DeleteSessionResponse {
  data: {
    sessionId: string;
    deleted: boolean;
    questionsAnswered: number;
  };
}

/**
 * Convert QuestionAnswer to HistoryEntry for API response.
 */
export function toHistoryEntry(qa: QuestionAnswer): HistoryEntry {
  return {
    number: qa.questionNumber,
    topic: qa.topic,
    difficulty: qa.difficulty,
    question: qa.question,
    answer: qa.answer,
    answeredAt: qa.answeredAt ? qa.answeredAt.toISOString() : null,
  };
}
