import { Module } from '@nestjs/common';
import { AtronController } from './atron.controller';
import { AtronService } from './atron.service';

@Module({
  controllers: [AtronController],
  providers: [AtronService],
})
export class AtronModule {}
