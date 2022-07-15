import { Module } from '@nestjs/common';
import { RebalanceVoteService } from './rebalance-vote.service';
import { AtronModule } from '../atron/atron.module';

@Module({
  imports: [AtronModule],
  providers: [RebalanceVoteService],
})
export class CronModule {}
