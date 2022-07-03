import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonService } from 'src/common/common.service';
import { tronWeb } from 'src/tronweb/tronweb.common';
import { Repository } from 'typeorm';
import { BuyTokenEvent } from '../entities/buy-token-event.entity';
import { BuyTokenEventType } from '../type/buy-token-event.type';

@Injectable()
export class BuyTokensEventListener {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly commonService: CommonService,
    @InjectRepository(BuyTokenEvent)
    private readonly buyTokenEvents: Repository<BuyTokenEvent>,
  ) {
    this.init();
  }

  private async getPrevEvents(): Promise<BuyTokenEventType[]> {
    const dexAddress = this.commonService.getDexContractAddress();
    let result: BuyTokenEventType[] = [];

    const lastBuyEvent = await this.buyTokenEvents.find({
      order: { timestamp: 'DESC' },
      take: 1,
    });

    let timestamp = new Date().getTime();

    while (true) {
      const events: BuyTokenEventType[] = await tronWeb.getEventResult(
        dexAddress,
        {
          eventName: 'BuyTokens',
          onlyConfirmed: true,
          size: 50,
          sinceTimestamp: timestamp,
        },
      );

      if (lastBuyEvent.length === 0) {
        result = result.concat(events);
        if (events.length === 50) {
          timestamp = events[49].timestamp - 1;
          continue;
        }
        break;
      }

      const filteredEvents = events.filter(
        (event) => event.timestamp > lastBuyEvent[0].timestamp,
      );
      const isExistTimestamp = events.some(
        (event) => event.timestamp === lastBuyEvent[0].timestamp,
      );

      result = result.concat(filteredEvents);

      if (isExistTimestamp) break;
    }

    return result;
  }

  private async init() {
    const dexContract = await this.commonService.getDexContact();

    const prevEvents: BuyTokenEventType[] = await this.getPrevEvents();

    prevEvents
      .sort((a, b) => a.timestamp - b.timestamp)
      .forEach((event) => this.handleButTokensEvent(event));

    dexContract.BuyTokens().watch(async (err, event: BuyTokenEventType) => {
      this.eventEmitter.emit('dex.BuyTokens', event);
    });
  }

  @OnEvent('dex.BuyTokens')
  handleButTokensEvent(event: BuyTokenEventType) {
    console.log(event);
  }
}
