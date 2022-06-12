import { Module } from '@nestjs/common';
import { AtronModule } from './atron/atron.module';

@Module({
  imports: [AtronModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
