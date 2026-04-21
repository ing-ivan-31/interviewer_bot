import { Module } from '@nestjs/common';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { SessionStore } from './session.store';
import { EvaluationGateway } from './evaluation.gateway';

@Module({
  controllers: [AgentController],
  providers: [AgentService, SessionStore, EvaluationGateway],
  exports: [AgentService],
})
export class AgentModule {}
