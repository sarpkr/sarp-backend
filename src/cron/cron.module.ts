import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuyTokenEvent } from '../atron/entities/buy-token-event.entity';
import { Vote } from '../atron/entities/vote.entity';
import { VoteLog } from '../atron/entities/vote-log.entity';
import { StakeLog } from '../atron/entities/stake-log.entity';
import { RebalanceVoteService } from './rebalance-vote.service';
import { AtronService } from '../atron/atron.service';
import { AtronModule } from '../atron/atron.module';
import { CommonService } from '../common/common.service';
import { HttpModule } from '@nestjs/axios';
import { Ledger } from '../atron/entities/ledger.entity';
import { DistributionLog } from '../atron/entities/distribution.log';

@Module({
  imports: [
    HttpModule,
    AtronModule,
    TypeOrmModule.forFeature([
      BuyTokenEvent,
      Vote,
      VoteLog,
      StakeLog,
      Ledger,
      DistributionLog,
    ]),
  ],
  providers: [RebalanceVoteService, AtronService, CommonService],
})
export class CronModule {}
