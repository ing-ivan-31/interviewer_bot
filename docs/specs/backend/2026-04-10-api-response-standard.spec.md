# API Response Standard + Swagger Documentation

**Status:** Done
**Author:** @spec-writer
**Date:** 2026-04-10
**Domain:** Backend

---

## Purpose

Establish a consistent API response format across all endpoints and integrate Swagger/OpenAPI documentation with detailed examples for the NestJS backend.

---

## Dependencies to Install

```bash
cd src/interviewer-evaluator-api

npm install @nestjs/swagger swagger-ui-express class-validator class-transformer
```

| Package | Purpose |
|---------|---------|
| `@nestjs/swagger` | Swagger/OpenAPI integration for NestJS |
| `swagger-ui-express` | Swagger UI for visualizing the API docs |
| `class-validator` | Decorators for DTO validation |
| `class-transformer` | Transform plain objects to class instances |

---

## Response Standard

### Success Responses

All successful responses wrap the payload in a `data` field. For paginated lists, include a `meta.pagination` object.

#### Single Resource Response

```json
{
  "data": {
    "id": "sess_abc123xyz",
    "status": "IN_PROGRESS",
    ...
  }
}
```

#### List Response (with pagination)

```json
{
  "data": [
    { "id": "sess_abc123xyz", ... },
    { "id": "sess_def456uvw", ... }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "perPage": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

#### List Response (without pagination)

When returning all items (e.g., small collections):

```json
{
  "data": [
    { "id": "sess_abc123xyz", ... }
  ]
}
```

### Error Responses

Use NestJS default structure for consistency with framework conventions:

```json
{
  "statusCode": 400,
  "message": "Answer is required",
  "error": "Bad Request"
}
```

#### Validation Errors (multiple fields)

For Zod/class-validator errors, return an array of messages:

```json
{
  "statusCode": 400,
  "message": ["answer must be a string", "answer should not be empty"],
  "error": "Bad Request"
}
```

#### HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Successful GET, PUT, PATCH, DELETE |
| 201 | Successful POST (resource created) |
| 204 | Successful DELETE (no content) — optional |
| 400 | Validation error, malformed request |
| 401 | Authentication required |
| 403 | Forbidden (authenticated but not authorized) |
| 404 | Resource not found |
| 409 | Conflict (e.g., duplicate, invalid state transition) |
| 500 | Internal server error |

---

## Files to Create/Modify

```
src/interviewer-evaluator-api/src/
├── main.ts                           # Add Swagger setup
├── common/
│   ├── dto/
│   │   ├── api-response.dto.ts       # Generic response wrappers
│   │   └── pagination.dto.ts         # Pagination metadata
│   ├── decorators/
│   │   └── api-responses.decorator.ts # Reusable Swagger decorators
│   └── filters/
│       └── http-exception.filter.ts  # Standardize error responses
└── modules/
    └── agent/
        ├── agent.controller.ts       # Add Swagger decorators
        └── dto/
            ├── create-session.dto.ts # Add Swagger decorators
            ├── submit-answer.dto.ts  # Add Swagger decorators
            └── session-response.dto.ts # Add Swagger decorators
```

---

## Swagger Configuration

### main.ts Setup

```typescript
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('JS/React Interviewer Evaluator API')
    .setDescription('API for AI-powered technical interview evaluation')
    .setVersion('1.0')
    .addTag('agent', 'Interview session management')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
```

Swagger UI will be available at: `http://localhost:3001/api/docs`

---

## Generic Response DTOs

### api-response.dto.ts

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationMeta {
  @ApiProperty({ example: 1, description: 'Current page number' })
  page: number;

  @ApiProperty({ example: 20, description: 'Items per page' })
  perPage: number;

  @ApiProperty({ example: 45, description: 'Total number of items' })
  total: number;

  @ApiProperty({ example: 3, description: 'Total number of pages' })
  totalPages: number;
}

export class ResponseMeta {
  @ApiPropertyOptional({ type: PaginationMeta })
  pagination?: PaginationMeta;
}

export class ApiResponseDto<T> {
  @ApiProperty({ description: 'Response payload' })
  data: T;

  @ApiPropertyOptional({ type: ResponseMeta })
  meta?: ResponseMeta;
}

export class ApiErrorDto {
  @ApiProperty({ example: 400, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({
    example: 'Validation failed',
    description: 'Error message or array of messages',
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }]
  })
  message: string | string[];

  @ApiProperty({ example: 'Bad Request', description: 'HTTP error name' })
  error: string;
}
```

---

## Controller Decorators Example

### agent.controller.ts (updated)

```typescript
import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { AgentService } from './agent.service';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import {
  CreateSessionResponseDto,
  SubmitAnswerResponseDto,
  GetSessionResponseDto,
  DeleteSessionResponseDto,
} from './dto/session-response.dto';

@ApiTags('agent')
@Controller('agent/sessions')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new interview session',
    description: 'Creates a new evaluation session and returns the first question. The first question is always JavaScript at junior difficulty.'
  })
  @ApiResponse({
    status: 201,
    description: 'Session created successfully',
    type: CreateSessionResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to generate question (LLM error)',
  })
  async createSession(): Promise<CreateSessionResponseDto> {
    return this.agentService.createSession();
  }

  @Post(':id/answer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Submit an answer',
    description: 'Submit an answer to the current question and receive the next question. Returns isComplete=true when all questions are answered.'
  })
  @ApiParam({
    name: 'id',
    description: 'Session ID (format: sess_<nanoid>)',
    example: 'sess_abc123xyz',
  })
  @ApiBody({ type: SubmitAnswerDto })
  @ApiResponse({
    status: 200,
    description: 'Answer recorded, next question returned',
    type: SubmitAnswerResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid answer or session already complete',
  })
  @ApiResponse({
    status: 404,
    description: 'Session not found',
  })
  async submitAnswer(
    @Param('id') id: string,
    @Body() dto: SubmitAnswerDto,
  ): Promise<SubmitAnswerResponseDto> {
    return this.agentService.submitAnswer(id, dto.answer);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get session status',
    description: 'Retrieve the current state of a session including progress and question history.'
  })
  @ApiParam({
    name: 'id',
    description: 'Session ID',
    example: 'sess_abc123xyz',
  })
  @ApiResponse({
    status: 200,
    description: 'Session details',
    type: GetSessionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Session not found',
  })
  getSession(@Param('id') id: string): GetSessionResponseDto {
    return this.agentService.getSession(id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a session',
    description: 'Permanently delete a session and all associated data.'
  })
  @ApiParam({
    name: 'id',
    description: 'Session ID',
    example: 'sess_abc123xyz',
  })
  @ApiResponse({
    status: 200,
    description: 'Session deleted',
    type: DeleteSessionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Session not found',
  })
  deleteSession(@Param('id') id: string): DeleteSessionResponseDto {
    return this.agentService.deleteSession(id);
  }
}
```

---

## DTO Examples with Swagger Decorators

### submit-answer.dto.ts (updated)

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { z } from 'zod';

// Zod schema (for runtime validation - keep existing)
export const SubmitAnswerSchema = z.object({
  answer: z
    .string()
    .min(1, 'Answer is required')
    .max(5000, 'Answer exceeds 5000 characters')
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, 'Answer is required'),
});

export type SubmitAnswerInput = z.infer<typeof SubmitAnswerSchema>;

// Class DTO (for Swagger documentation)
export class SubmitAnswerDto {
  @ApiProperty({
    description: 'The candidate\'s answer to the current question',
    example: 'let and const are block-scoped while var is function-scoped. const prevents reassignment but not mutation of objects.',
    minLength: 1,
    maxLength: 5000,
  })
  @IsString()
  @IsNotEmpty({ message: 'Answer is required' })
  @MaxLength(5000, { message: 'Answer exceeds 5000 characters' })
  answer: string;
}
```

### session-response.dto.ts (updated)

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class QuestionInfoDto {
  @ApiProperty({ example: 1, description: 'Question number (1-based)' })
  number: number;

  @ApiProperty({
    example: 'javascript',
    enum: ['javascript', 'react'],
    description: 'Topic category'
  })
  topic: 'javascript' | 'react';

  @ApiProperty({
    example: 'junior',
    enum: ['junior', 'mid', 'senior'],
    description: 'Difficulty level'
  })
  difficulty: 'junior' | 'mid' | 'senior';

  @ApiProperty({
    example: 'What is the difference between let, const, and var in JavaScript?',
    description: 'The question text'
  })
  text: string;
}

export class ProgressInfoDto {
  @ApiProperty({ example: 3, description: 'Number of questions answered' })
  answered: number;

  @ApiProperty({ example: 10, description: 'Total questions in session' })
  total: number;
}

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

// ... similar updates for other response DTOs
```

---

## HTTP Exception Filter (optional standardization)

### http-exception.filter.ts

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Standardize error response format
    const errorResponse =
      typeof exceptionResponse === 'string'
        ? {
            statusCode: status,
            message: exceptionResponse,
            error: HttpStatus[status],
          }
        : {
            statusCode: status,
            ...exceptionResponse,
          };

    response.status(status).json(errorResponse);
  }
}
```

Register in `main.ts`:

```typescript
app.useGlobalFilters(new HttpExceptionFilter());
```

---

## Invariants

- All successful responses MUST wrap payload in `{ data: ... }`
- All error responses MUST include `statusCode`, `message`, and `error` fields
- Pagination metadata ONLY appears on list endpoints that support it
- Swagger documentation MUST be kept in sync with actual response types
- All DTOs used in Swagger MUST have `@ApiProperty` decorators
- Swagger UI is only enabled in development (check NODE_ENV in production)

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Empty array response | `{ data: [] }` — never null |
| Null optional field | Field omitted from response OR explicit null |
| Validation with multiple errors | `message` is array of strings |
| Unknown route | 404 with standard error format |
| Unhandled exception | 500 with generic message (no stack in production) |
| Swagger in production | Consider disabling or protecting with auth |

---

## Acceptance Criteria

- [ ] `npm install` succeeds for Swagger dependencies
- [ ] Swagger UI accessible at `/api/docs` in development
- [ ] All existing endpoints have Swagger decorators with descriptions
- [ ] All DTOs have `@ApiProperty` decorators with examples
- [ ] Success responses wrap payload in `{ data: ... }`
- [ ] Error responses include `statusCode`, `message`, `error`
- [ ] Validation errors return array of messages
- [ ] Pagination metadata appears on list endpoints
- [ ] `npm run typecheck` passes
- [ ] Existing tests continue to pass
- [ ] `.claude/agents/backend.md` updated with Swagger and response standard conventions
- [ ] New controllers MUST follow Swagger decorator checklist from backend.md
- [ ] New DTOs MUST have `@ApiProperty` on every field

---

## Changes to Existing Agent Module

### agent.controller.ts — Required Changes

Current file lacks Swagger decorators. Add the following:

```typescript
import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { AgentService } from './agent.service';
import { SubmitAnswerDto, SubmitAnswerSchema } from './dto/submit-answer.dto';
import {
  CreateSessionResponseDto,
  SubmitAnswerResponseDto,
  GetSessionResponseDto,
  DeleteSessionResponseDto,
} from './dto/session-response.dto';

@ApiTags('agent')
@Controller('agent/sessions')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new interview session',
    description: 'Creates a new evaluation session and returns the first question. The first question is always JavaScript at junior difficulty.',
  })
  @ApiResponse({
    status: 201,
    description: 'Session created successfully',
    type: CreateSessionResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to generate question (LLM error)',
  })
  async createSession(): Promise<CreateSessionResponseDto> {
    // ... existing implementation
  }

  @Post(':id/answer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Submit an answer',
    description: 'Submit an answer to the current question and receive the next question. Returns isComplete=true when all questions are answered.',
  })
  @ApiParam({
    name: 'id',
    description: 'Session ID (format: sess_<nanoid>)',
    example: 'sess_abc123xyz',
  })
  @ApiBody({ type: SubmitAnswerDto })
  @ApiResponse({
    status: 200,
    description: 'Answer recorded, next question returned',
    type: SubmitAnswerResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid answer or session already complete',
  })
  @ApiResponse({
    status: 404,
    description: 'Session not found',
  })
  async submitAnswer(
    @Param('id') id: string,
    @Body() body: unknown,
  ): Promise<SubmitAnswerResponseDto> {
    // ... existing implementation
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get session status',
    description: 'Retrieve the current state of a session including progress and question history.',
  })
  @ApiParam({
    name: 'id',
    description: 'Session ID',
    example: 'sess_abc123xyz',
  })
  @ApiResponse({
    status: 200,
    description: 'Session details',
    type: GetSessionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Session not found',
  })
  getSession(@Param('id') id: string): GetSessionResponseDto {
    // ... existing implementation
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a session',
    description: 'Permanently delete a session and all associated data.',
  })
  @ApiParam({
    name: 'id',
    description: 'Session ID',
    example: 'sess_abc123xyz',
  })
  @ApiResponse({
    status: 200,
    description: 'Session deleted',
    type: DeleteSessionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Session not found',
  })
  deleteSession(@Param('id') id: string): DeleteSessionResponseDto {
    // ... existing implementation
  }
}
```

---

### submit-answer.dto.ts — Required Changes

Keep Zod schema for runtime validation. Add class-based DTO for Swagger:

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

// Zod schema (keep for runtime validation)
export const SubmitAnswerSchema = z.object({
  answer: z
    .string()
    .min(1, 'Answer is required')
    .max(2500, 'Answer exceeds 2500 characters')
    .refine((val) => val.trim().length > 0, {
      message: 'Answer is required',
    }),
});

export type SubmitAnswerInput = z.infer<typeof SubmitAnswerSchema>;

// Class DTO (for Swagger documentation)
export class SubmitAnswerDto {
  @ApiProperty({
    description: "The candidate's answer to the current question",
    example: 'let and const are block-scoped while var is function-scoped. const prevents reassignment but not mutation of objects.',
    minLength: 1,
    maxLength: 2500,
  })
  answer: string;
}
```

---

### session-response.dto.ts — Required Changes

Convert interfaces to classes with `@ApiProperty` decorators:

```typescript
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

  @ApiPropertyOptional({ example: 'let and const are block-scoped...', nullable: true })
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

  @ApiPropertyOptional({ example: 'Interview complete. All 10 questions answered.' })
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

// Keep helper function
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
```

---

## Implementation Order

1. **Install dependencies** — `npm install @nestjs/swagger swagger-ui-express class-validator class-transformer`
2. **Create common DTOs** — `api-response.dto.ts`, `pagination.dto.ts`
3. **Update main.ts** — Add Swagger configuration
4. **Update session-response.dto.ts** — Convert interfaces to classes with `@ApiProperty`
5. **Update submit-answer.dto.ts** — Add class-based DTO alongside Zod
6. **Update agent.controller.ts** — Add `@ApiTags`, `@ApiOperation`, `@ApiResponse` decorators
7. **Create HttpExceptionFilter** — Standardize error responses
8. **Register filter** — Add to main.ts
9. **Test manually** — Visit `/api/docs` and verify all endpoints documented
10. **Verify existing tests** — Ensure no regressions

---

## Notes

- Keep Zod schemas for runtime validation (they're more powerful)
- Use class-based DTOs for Swagger documentation only
- Consider using `nestjs-zod` package to bridge Zod and Swagger in the future
- Swagger JSON is available at `/api/docs-json` for programmatic access
- This standard should be applied to all future modules (auth, reports, etc.)
