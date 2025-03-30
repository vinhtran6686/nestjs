import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { SharedModule } from '@/shared/modules/shared.module';

@Module({
  imports: [TerminusModule, SharedModule],
  controllers: [HealthController],
  providers: [],
})
export class HealthModule {}
