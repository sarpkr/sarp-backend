import { Module } from '@nestjs/common';
import { AtronModule } from './atron/atron.module';
import { SchedulerModule } from './scheduler/scheduler.module';

@Module({
  imports: [AtronModule, SchedulerModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
