import { Injectable, OnModuleInit } from '@nestjs/common';
import { buildGraph } from './graph/graph';
import { AgentState, QuestionAnswer } from './graph/state';
import { SessionStore } from './session.store';
import {
  CreateSessionResponse,
  SubmitAnswerResponse,
  GetSessionResponse,
  DeleteSessionResponse,
  toHistoryEntry,
} from './dto/session-response.dto';

@Injectable()
export class AgentService implements OnModuleInit {
  private graph!: ReturnType<typeof buildGraph>;

  constructor(private readonly sessionStore: SessionStore) {}

  /**
   * Compile the graph ONCE at service initialization.
   */
  onModuleInit(): void {
    this.graph = buildGraph();
  }

  /**
   * Create a new session and generate the first question.
   */
  async createSession(): Promise<CreateSessionResponse> {
    const session = this.sessionStore.create();

    // Prepare initial state for graph invocation
    const initialState: AgentState = {
      sessionId: session.id,
      maxQuestions: session.maxQuestions,
      currentQuestionNumber: session.currentQuestionNumber,
      history: [],
      currentQuestion: null,
      currentTopic: session.currentTopic,
      currentDifficulty: session.currentDifficulty,
      isComplete: false,
      error: null,
    };

    // Run graph to generate first question
    const result = await this.graph.invoke(initialState);

    if (result.error || !result.currentQuestion) {
      throw new Error(result.error || 'Failed to generate question');
    }

    // Update session with generated question
    this.sessionStore.update(session.id, {
      currentQuestion: result.currentQuestion,
    });

    return {
      data: {
        sessionId: session.id,
        maxQuestions: session.maxQuestions,
        question: {
          number: session.currentQuestionNumber,
          topic: session.currentTopic,
          difficulty: session.currentDifficulty,
          text: result.currentQuestion,
        },
        isComplete: false,
      },
    };
  }

  /**
   * Submit an answer and get the next question.
   */
  async submitAnswer(
    sessionId: string,
    answer: string,
  ): Promise<SubmitAnswerResponse> {
    const session = this.sessionStore.get(sessionId);

    if (!session) {
      throw new Error('Session not found');
    }

    if (session.isComplete) {
      throw new Error('Session is already complete');
    }

    if (!session.currentQuestion) {
      throw new Error('No question to answer');
    }

    // Record the answered question
    const answeredQA: QuestionAnswer = {
      questionNumber: session.currentQuestionNumber,
      topic: session.currentTopic,
      difficulty: session.currentDifficulty,
      question: session.currentQuestion,
      answer: answer.trim(),
      answeredAt: new Date(),
    };

    const updatedHistory = [...session.history, answeredQA];
    const nextQuestionNumber = session.currentQuestionNumber + 1;
    const isComplete = updatedHistory.length >= session.maxQuestions;

    // If complete, update session and return
    if (isComplete) {
      this.sessionStore.update(sessionId, {
        history: updatedHistory,
        currentQuestion: null,
        isComplete: true,
      });

      return {
        data: {
          sessionId,
          answeredQuestion: {
            number: answeredQA.questionNumber,
            topic: answeredQA.topic,
            difficulty: answeredQA.difficulty,
          },
          nextQuestion: null,
          progress: {
            answered: updatedHistory.length,
            total: session.maxQuestions,
          },
          isComplete: true,
          message: `Interview complete. All ${session.maxQuestions} questions answered.`,
        },
      };
    }

    // Get next topic and difficulty
    const { topic, difficulty } =
      this.sessionStore.getNextTopicAndDifficulty(nextQuestionNumber);

    // Prepare state for graph invocation
    const state: AgentState = {
      sessionId,
      maxQuestions: session.maxQuestions,
      currentQuestionNumber: nextQuestionNumber,
      history: updatedHistory,
      currentQuestion: null,
      currentTopic: topic,
      currentDifficulty: difficulty,
      isComplete: false,
      error: null,
    };

    // Run graph to generate next question
    const result = await this.graph.invoke(state);

    if (result.error || !result.currentQuestion) {
      throw new Error(result.error || 'Failed to generate question');
    }

    // Update session
    this.sessionStore.update(sessionId, {
      history: updatedHistory,
      currentQuestionNumber: nextQuestionNumber,
      currentQuestion: result.currentQuestion,
      currentTopic: topic,
      currentDifficulty: difficulty,
    });

    return {
      data: {
        sessionId,
        answeredQuestion: {
          number: answeredQA.questionNumber,
          topic: answeredQA.topic,
          difficulty: answeredQA.difficulty,
        },
        nextQuestion: {
          number: nextQuestionNumber,
          topic,
          difficulty,
          text: result.currentQuestion,
        },
        progress: {
          answered: updatedHistory.length,
          total: session.maxQuestions,
        },
        isComplete: false,
      },
    };
  }

  /**
   * Get session status and history.
   */
  getSession(sessionId: string): GetSessionResponse {
    const session = this.sessionStore.get(sessionId);

    if (!session) {
      throw new Error('Session not found');
    }

    return {
      data: {
        sessionId: session.id,
        maxQuestions: session.maxQuestions,
        progress: {
          answered: session.history.length,
          total: session.maxQuestions,
        },
        currentQuestion: session.currentQuestion
          ? {
              number: session.currentQuestionNumber,
              topic: session.currentTopic,
              difficulty: session.currentDifficulty,
              text: session.currentQuestion,
            }
          : null,
        history: session.history.map(toHistoryEntry),
        isComplete: session.isComplete,
        createdAt: session.createdAt.toISOString(),
      },
    };
  }

  /**
   * Delete a session.
   */
  deleteSession(sessionId: string): DeleteSessionResponse {
    const session = this.sessionStore.get(sessionId);

    if (!session) {
      throw new Error('Session not found');
    }

    const questionsAnswered = session.history.length;
    this.sessionStore.delete(sessionId);

    return {
      data: {
        sessionId,
        deleted: true,
        questionsAnswered,
      },
    };
  }
}
