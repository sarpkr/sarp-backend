import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from 'src/common/common.module';

import { AtronController } from './atron.controller';
import { AtronService } from './atron.service';

import { BuyTokenEvent } from './entities/buy-token-event.entity';
import { DistributionLogEntity } from './entities/distribution-log.entity';
import { Ledger } from './entities/ledger.entity';
import { StakeLog } from './entities/stake-log.entity';
import { VoteLog } from './entities/vote-log.entity';

import { BuyTokensEventListener } from './listeners/buy-token.listener';

@Module({
  imports: [
    CommonModule,
    TypeOrmModule.forFeature([
      BuyTokenEvent,
      VoteLog,
      StakeLog,
      Ledger,
      DistributionLogEntity,
    ]),
  ],
  exports: [AtronService],
  controllers: [AtronController],
  providers: [AtronService, BuyTokensEventListener],
})
export class AtronModule {}
