import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from 'src/common/common.module';
import { AtronController } from './atron.controller';
import { AtronService } from './atron.service';
import { BuyTokenEvent } from './entities/buy-token-event.entity';
import { StakeLog } from './entities/stake-log.entity';
import { VoteLog } from './entities/vote-log.entity';
import { Vote } from './entities/vote.entity';
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
      Vote,
      VoteLog,
      StakeLog,
      Ledger,
      DistributionLog,
    ]),
  ],
  controllers: [AtronController],
  providers: [AtronService, BuyTokensEventListener],
})
export class AtronModule {}
