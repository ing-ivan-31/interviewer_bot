import { Module } from '@nestjs/common';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { SessionStore } from './session.store';

@Module({
  controllers: [AgentController],
  providers: [AgentService, SessionStore],
  exports: [AgentService],
})
export class AgentModule {}
