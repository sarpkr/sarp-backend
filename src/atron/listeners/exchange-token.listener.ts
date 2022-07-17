import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonService } from 'src/common/common.service';
import { tronWeb } from 'src/tronweb/tronweb.common';
import { Repository } from 'typeorm';
import { AtronService } from '../atron.service';
import { ExchangeTokenEvent } from '../entities/exchange-token-event.entity';
import { ExchangeTokenEventType } from '../type/event.type';

@Injectable()
export class ExchangeTokensEventListener {
  constructor(
    private readonly eventEmitter: EventEmitter2,

    private readonly commonService: CommonService,
    private readonly atronService: AtronService,

    @InjectRepository(ExchangeTokenEvent)
    private readonly exchangeTokensEvents: Repository<ExchangeTokenEvent>,
  ) {
    this.init();
  }

  private async getPrevEvents(): Promise<ExchangeTokenEventType[]> {
    const dexAddress = this.commonService.getDexContractAddress();
    let result: ExchangeTokenEventType[] = [];

    const lastExchangeEvent = await this.exchangeTokensEvents.find({
      order: { timestamp: 'DESC' },
      take: 1,
    });

    let timestamp = new Date().getTime();

    while (true) {
      const events: ExchangeTokenEventType[] = await tronWeb.getEventResult(
        dexAddress,
        {
          eventName: 'ExchangeTokens',
          onlyConfirmed: true,
          size: 50,
          sinceTimestamp: timestamp,
        },
      );

      if (lastExchangeEvent.length === 0) {
        result = result.concat(events);
        if (events.length === 50) {
          timestamp = events[49].timestamp - 1;
          continue;
        }
        break;
      }

      const filteredEvents = events.filter(
        (event) => event.timestamp > Number(lastExchangeEvent[0].timestamp),
      );
      const isExistTimestamp = events.some(
        (event) => event.timestamp === Number(lastExchangeEvent[0].timestamp),
      );

      result = result.concat(filteredEvents);

      if (isExistTimestamp) break;
    }

    return result;
  }

  private async init() {
    const dexContract = await this.commonService.getDexContact();

    const prevEvents: ExchangeTokenEventType[] = await this.getPrevEvents();

    prevEvents
      .sort((a, b) => a.timestamp - b.timestamp)
      .forEach((event) => this.handleButTokensEvent(event));

    dexContract
      .ExchangeTokens()
      .watch(async (err, event: ExchangeTokenEventType) => {
        this.eventEmitter.emit('dex.ExchangeTokens', event);
        //todo err
      });
  }

  @OnEvent('dex.ExchangeTokens')
  async handleButTokensEvent(event: ExchangeTokenEventType) {
    const buyerAddress = tronWeb.address.fromHex(event.result.buyer);

    this.atronService.exchange(
      buyerAddress,
      event.result.tokenAmountToExchange,
    );
  }
}
