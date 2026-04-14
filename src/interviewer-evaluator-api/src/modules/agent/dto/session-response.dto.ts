import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Topic, Difficulty, QuestionAnswer } from '../graph/state';

export class QuestionInfoDto {
  @ApiProperty({ example: 1, description: 'Question number (1-based)' })
  number: number;

  @ApiProperty({
    example: 'javascript',
    enum: ['javascript', 'react'],
    description: 'Topic category',
  })
  topic: Topic;

  @ApiProperty({
    example: 'junior',
    enum: ['junior', 'mid', 'senior'],
    description: 'Difficulty level',
  })
  difficulty: Difficulty;

  @ApiProperty({
    example: 'What is the difference between let, const, and var in JavaScript?',
    description: 'The question text',
  })
  text: string;
}

export class ProgressInfoDto {
  @ApiProperty({ example: 3, description: 'Number of questions answered' })
  answered: number;

  @ApiProperty({ example: 10, description: 'Total questions in session' })
  total: number;
}

export class AnsweredQuestionInfoDto {
  @ApiProperty({ example: 1 })
  number: number;

  @ApiProperty({ example: 'javascript', enum: ['javascript', 'react'] })
  topic: Topic;

  @ApiProperty({ example: 'junior', enum: ['junior', 'mid', 'senior'] })
  difficulty: Difficulty;
}

export class HistoryEntryDto {
  @ApiProperty({ example: 1 })
  number: number;

  @ApiProperty({ example: 'javascript', enum: ['javascript', 'react'] })
  topic: Topic;

  @ApiProperty({ example: 'junior', enum: ['junior', 'mid', 'senior'] })
  difficulty: Difficulty;

  @ApiProperty({ example: 'What is the difference between let, const, and var?' })
  question: string;

  @ApiPropertyOptional({
    example: 'let and const are block-scoped...',
    nullable: true,
  })
  answer: string | null;

  @ApiPropertyOptional({ example: '2026-04-10T10:30:00.000Z', nullable: true })
  answeredAt: string | null;
}

// --- Response wrapper classes ---

export class CreateSessionDataDto {
  @ApiProperty({ example: 'sess_abc123xyz' })
  sessionId: string;

  @ApiProperty({ example: 10 })
  maxQuestions: number;

  @ApiProperty({ type: QuestionInfoDto })
  question: QuestionInfoDto;

  @ApiProperty({ example: false })
  isComplete: boolean;
}

export class CreateSessionResponseDto {
  @ApiProperty({ type: CreateSessionDataDto })
  data: CreateSessionDataDto;
}

export class SubmitAnswerDataDto {
  @ApiProperty({ example: 'sess_abc123xyz' })
  sessionId: string;

  @ApiProperty({ type: AnsweredQuestionInfoDto })
  answeredQuestion: AnsweredQuestionInfoDto;

  @ApiPropertyOptional({ type: QuestionInfoDto, nullable: true })
  nextQuestion: QuestionInfoDto | null;

  @ApiProperty({ type: ProgressInfoDto })
  progress: ProgressInfoDto;

  @ApiProperty({ example: false })
  isComplete: boolean;

  @ApiPropertyOptional({
    example: 'Interview complete. All 10 questions answered.',
  })
  message?: string;
}

export class SubmitAnswerResponseDto {
  @ApiProperty({ type: SubmitAnswerDataDto })
  data: SubmitAnswerDataDto;
}

export class GetSessionDataDto {
  @ApiProperty({ example: 'sess_abc123xyz' })
  sessionId: string;

  @ApiProperty({ example: 10 })
  maxQuestions: number;

  @ApiProperty({ type: ProgressInfoDto })
  progress: ProgressInfoDto;

  @ApiPropertyOptional({ type: QuestionInfoDto, nullable: true })
  currentQuestion: QuestionInfoDto | null;

  @ApiProperty({ type: [HistoryEntryDto] })
  history: HistoryEntryDto[];

  @ApiProperty({ example: false })
  isComplete: boolean;

  @ApiProperty({ example: '2026-04-10T10:25:00.000Z' })
  createdAt: string;
}

export class GetSessionResponseDto {
  @ApiProperty({ type: GetSessionDataDto })
  data: GetSessionDataDto;
}

export class DeleteSessionDataDto {
  @ApiProperty({ example: 'sess_abc123xyz' })
  sessionId: string;

  @ApiProperty({ example: true })
  deleted: boolean;

  @ApiProperty({ example: 5 })
  questionsAnswered: number;
}

export class DeleteSessionResponseDto {
  @ApiProperty({ type: DeleteSessionDataDto })
  data: DeleteSessionDataDto;
}

// --- Type aliases for backward compatibility ---

export type QuestionInfo = QuestionInfoDto;
export type ProgressInfo = ProgressInfoDto;
export type AnsweredQuestionInfo = AnsweredQuestionInfoDto;
export type HistoryEntry = HistoryEntryDto;
export type CreateSessionResponse = CreateSessionResponseDto;
export type SubmitAnswerResponse = SubmitAnswerResponseDto;
export type GetSessionResponse = GetSessionResponseDto;
export type DeleteSessionResponse = DeleteSessionResponseDto;

/**
 * Convert QuestionAnswer to HistoryEntry for API response.
 */
export function toHistoryEntry(qa: QuestionAnswer): HistoryEntryDto {
  return {
    number: qa.questionNumber,
    topic: qa.topic,
    difficulty: qa.difficulty,
    question: qa.question,
    answer: qa.answer,
    answeredAt: qa.answeredAt ? qa.answeredAt.toISOString() : null,
  };
}
