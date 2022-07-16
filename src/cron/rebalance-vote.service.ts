import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AtronService } from '../atron/atron.service';

@Injectable()
export class RebalanceVoteService {
  constructor(private readonly atronService: AtronService) {}

  private readonly logger = new Logger(RebalanceVoteService.name);

  @Cron('0 0,6,12,18 * * *')
  voteOptimalNode() {
    this.atronService.voteOptimalNode().then(() => {
      this.logger.log('Successfully voted for optimal node');
    });
  }

  @Cron('58 23,5,11,17 * * *')
  withdrawReward() {
    this.atronService.withdrawReward().then(() => {
      this.logger.log('Successfully withdraw rewards');
    });
  }
  @Cron('59 23,5,11,17 * * *')
  distributeReward() {
    this.atronService.distributeReward().then(() => {
      this.logger.log('Successfully distributed rewards');
    });
  }
}
