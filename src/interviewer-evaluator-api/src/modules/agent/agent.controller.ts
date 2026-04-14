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
import { ApiErrorDto } from '../../common/dto/api-response.dto';

@ApiTags('agent')
@Controller('agent/sessions')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  /**
   * POST /agent/sessions
   * Create a new session and return the first question.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new interview session',
    description:
      'Creates a new evaluation session and returns the first question. The first question is always JavaScript at junior difficulty.',
  })
  @ApiResponse({
    status: 201,
    description: 'Session created successfully',
    type: CreateSessionResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to generate question (LLM error)',
    type: ApiErrorDto,
  })
  async createSession(): Promise<CreateSessionResponseDto> {
    try {
      return await this.agentService.createSession();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create session';

      console.log(error);
      throw new InternalServerErrorException({
        error: 'Failed to generate question',
        details: message,
      });
    }
  }

  /**
   * POST /agent/sessions/:id/answer
   * Submit an answer and get the next question.
   */
  @Post(':id/answer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Submit an answer',
    description:
      'Submit an answer to the current question and receive the next question. Returns isComplete=true when all questions are answered.',
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
    type: ApiErrorDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Session not found',
    type: ApiErrorDto,
  })
  async submitAnswer(
    @Param('id') id: string,
    @Body() body: unknown,
  ): Promise<SubmitAnswerResponseDto> {
    // Validate body with Zod
    const validation = SubmitAnswerSchema.safeParse(body);

    if (!validation.success) {
      const messages = validation.error.issues.map((issue) => issue.message);
      throw new BadRequestException({
        message: messages.length === 1 ? messages[0] : messages,
        error: 'Bad Request',
      });
    }

    try {
      return await this.agentService.submitAnswer(id, validation.data.answer);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';

      if (message === 'Session not found') {
        throw new NotFoundException({
          message: 'Session not found',
          error: 'Not Found',
        });
      }

      if (message === 'Session is already complete') {
        throw new BadRequestException({
          message: 'Session is already complete',
          error: 'Bad Request',
        });
      }

      throw new InternalServerErrorException({
        message: 'Failed to generate question',
        error: 'Internal Server Error',
      });
    }
  }

  /**
   * GET /agent/sessions/:id
   * Get session status and history.
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get session status',
    description:
      'Retrieve the current state of a session including progress and question history.',
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
    type: ApiErrorDto,
  })
  getSession(@Param('id') id: string): GetSessionResponseDto {
    try {
      return this.agentService.getSession(id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';

      if (message === 'Session not found') {
        throw new NotFoundException({
          message: 'Session not found',
          error: 'Not Found',
        });
      }

      throw new InternalServerErrorException({
        message: message,
        error: 'Internal Server Error',
      });
    }
  }

  /**
   * DELETE /agent/sessions/:id
   * Delete a session.
   */
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
    type: ApiErrorDto,
  })
  deleteSession(@Param('id') id: string): DeleteSessionResponseDto {
    try {
      return this.agentService.deleteSession(id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';

      if (message === 'Session not found') {
        throw new NotFoundException({
          message: 'Session not found',
          error: 'Not Found',
        });
      }

      throw new InternalServerErrorException({
        message: message,
        error: 'Internal Server Error',
      });
    }
  }
}
