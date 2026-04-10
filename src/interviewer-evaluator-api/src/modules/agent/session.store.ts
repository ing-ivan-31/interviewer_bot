import { Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { getMaxQuestionsPerSession } from '../../config/llm.config';
import { Topic, Difficulty, QuestionAnswer } from './graph/state';

export interface StoredSession {
  id: string;
  maxQuestions: number;
  currentQuestionNumber: number;
  history: QuestionAnswer[];
  currentQuestion: string | null;
  currentTopic: Topic;
  currentDifficulty: Difficulty;
  isComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class SessionStore {
  private readonly sessions = new Map<string, StoredSession>();

  /**
   * Create a new session with initial state.
   */
  create(): StoredSession {
    const id = `sess_${nanoid(12)}`;
    const { topic, difficulty } = this.getNextTopicAndDifficulty(1);
    const now = new Date();

    const session: StoredSession = {
      id,
      maxQuestions: getMaxQuestionsPerSession(),
      currentQuestionNumber: 1,
      history: [],
      currentQuestion: null,
      currentTopic: topic,
      currentDifficulty: difficulty,
      isComplete: false,
      createdAt: now,
      updatedAt: now,
    };

    this.sessions.set(id, session);
    return session;
  }

  /**
   * Get a session by ID.
   */
  get(id: string): StoredSession | undefined {
    return this.sessions.get(id);
  }

  /**
   * Update a session with partial data.
   */
  update(id: string, updates: Partial<StoredSession>): StoredSession {
    const session = this.sessions.get(id);
    if (!session) {
      throw new Error(`Session ${id} not found`);
    }

    const updated: StoredSession = {
      ...session,
      ...updates,
      updatedAt: new Date(),
    };

    this.sessions.set(id, updated);
    return updated;
  }

  /**
   * Delete a session.
   */
  delete(id: string): boolean {
    return this.sessions.delete(id);
  }

  /**
   * Determine topic and difficulty for a given question number.
   *
   * Topic alternation: JS -> React -> JS -> React...
   * Difficulty progression: 2 junior -> 2 mid -> rest senior
   */
  getNextTopicAndDifficulty(questionNumber: number): {
    topic: Topic;
    difficulty: Difficulty;
  } {
    // Topic alternates based on odd/even question number
    const topic: Topic = questionNumber % 2 === 1 ? 'javascript' : 'react';

    // Difficulty: Q1-2 = junior, Q3-4 = mid, Q5+ = senior
    let difficulty: Difficulty;
    if (questionNumber <= 2) {
      difficulty = 'mid';
    } else if (questionNumber <= 5) {
      difficulty = 'mid';
    } else {
      difficulty = 'senior';
    }

    return { topic, difficulty };
  }
}
