import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AtronModule } from './atron/atron.module';

@Module({
  imports: [ScheduleModule.forRoot(), AtronModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
