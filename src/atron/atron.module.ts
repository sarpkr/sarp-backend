import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from 'src/common/common.module';

import { AtronController } from './atron.controller';
import { AtronService } from './atron.service';

import { BuyTokenEvent } from './entities/buy-token-event.entity';
import { StakeLog } from './entities/stake-log.entity';
import { VoteLog } from './entities/vote-log.entity';

import { BuyTokensEventListener } from './listeners/buy-token.listener';
import { Ledger } from './entities/ledger.entity';
import { DistributionLog } from './entities/distribution.log';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    CommonModule,
    HttpModule,
    TypeOrmModule.forFeature([
      BuyTokenEvent,
      VoteLog,
      StakeLog,
      Ledger,
      DistributionLog,
    ]),
  ],
  exports: [AtronService],
  controllers: [AtronController],
  providers: [AtronService, BuyTokensEventListener],
})
export class AtronModule {}
