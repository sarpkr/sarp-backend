import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AtronService } from '../atron/atron.service';

@Injectable()
export class RebalanceVoteService {
  constructor(private readonly atronService: AtronService) {}

  private readonly logger = new Logger(RebalanceVoteService.name);

  @Cron('0 0 0,6,12,18 * * *')
  handleCron() {
    this.atronService.voteOptimalNode().then(() => {
      this.logger.log('Successfully voted for optimal node');
    });
  }
}
