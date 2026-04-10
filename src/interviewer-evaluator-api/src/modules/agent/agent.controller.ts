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
import { AgentService } from './agent.service';
import { SubmitAnswerSchema } from './dto/submit-answer.dto';
import {
  CreateSessionResponse,
  SubmitAnswerResponse,
  GetSessionResponse,
  DeleteSessionResponse,
} from './dto/session-response.dto';

@Controller('agent/sessions')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  /**
   * POST /agent/sessions
   * Create a new session and return the first question.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createSession(): Promise<CreateSessionResponse> {
    try {
      return await this.agentService.createSession();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create session';
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
  async submitAnswer(
    @Param('id') id: string,
    @Body() body: unknown,
  ): Promise<SubmitAnswerResponse> {
    // Validate body with Zod
    const validation = SubmitAnswerSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.issues[0];
      throw new BadRequestException({
        error: firstError?.message || 'Invalid request body',
      });
    }

    try {
      return await this.agentService.submitAnswer(id, validation.data.answer);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';

      if (message === 'Session not found') {
        throw new NotFoundException({ error: 'Session not found' });
      }

      if (message === 'Session is already complete') {
        throw new BadRequestException({
          error: 'Session is already complete',
        });
      }

      throw new InternalServerErrorException({
        error: 'Failed to generate question',
        details: message,
      });
    }
  }

  /**
   * GET /agent/sessions/:id
   * Get session status and history.
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  getSession(@Param('id') id: string): GetSessionResponse {
    try {
      return this.agentService.getSession(id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';

      if (message === 'Session not found') {
        throw new NotFoundException({ error: 'Session not found' });
      }

      throw new InternalServerErrorException({ error: message });
    }
  }

  /**
   * DELETE /agent/sessions/:id
   * Delete a session.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  deleteSession(@Param('id') id: string): DeleteSessionResponse {
    try {
      return this.agentService.deleteSession(id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';

      if (message === 'Session not found') {
        throw new NotFoundException({ error: 'Session not found' });
      }

      throw new InternalServerErrorException({ error: message });
    }
  }
}
