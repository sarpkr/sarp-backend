import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from 'src/common/common.module';
import { AtronController } from './atron.controller';
import { AtronService } from './atron.service';
import { BuyTokenEvent } from './entities/buy-token-event.entity';
import { BuyTokensEventListener } from './listeners/buy-token.listener';

@Module({
  imports: [CommonModule, TypeOrmModule.forFeature([BuyTokenEvent])],
  controllers: [AtronController],
  providers: [AtronService, BuyTokensEventListener],
})
export class AtronModule {}
