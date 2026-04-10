import { Annotation } from '@langchain/langgraph';

export type Topic = 'javascript' | 'react';
export type Difficulty = 'junior' | 'mid' | 'senior';

export interface QuestionAnswer {
  questionNumber: number;
  topic: Topic;
  difficulty: Difficulty;
  question: string;
  answer: string | null;
  answeredAt: Date | null;
}

/**
 * LangGraph AgentState using Annotation for channel definitions.
 */
export const AgentStateAnnotation = Annotation.Root({
  // Session identity
  sessionId: Annotation<string>(),

  // Configuration (from env)
  maxQuestions: Annotation<number>(),

  // Progress tracking
  currentQuestionNumber: Annotation<number>(),
  history: Annotation<QuestionAnswer[]>({
    reducer: (current, update) => [...current, ...update],
    default: () => [],
  }),

  // Current turn
  currentQuestion: Annotation<string | null>(),
  currentTopic: Annotation<Topic>(),
  currentDifficulty: Annotation<Difficulty>(),

  // Status
  isComplete: Annotation<boolean>(),
  error: Annotation<string | null>(),
});

export type AgentState = typeof AgentStateAnnotation.State;
