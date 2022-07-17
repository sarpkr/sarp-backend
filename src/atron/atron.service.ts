import { MoreThanOrEqual, Repository } from 'typeorm';
import { groupBy } from 'lodash';
import { getUnixTime } from 'date-fns';
import BigNumber from 'bignumber.js';

import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

import { CommonService } from 'src/common/common.service';
import { tronWeb } from 'src/tronweb/tronweb.common';
import { MAINNET_API_URL, TESTNET_API_URL } from '../common/common.setting';

import { StakeLog } from './entities/stake-log.entity';
import { VoteLog } from './entities/vote-log.entity';
import { Ledger } from './entities/ledger.entity';
import { DistributionLog } from './entities/distribution.log';
import { BuyTokenEvent } from './entities/buy-token-event.entity';

@Injectable()
export class AtronService {
  private readonly walletAddress = tronWeb.defaultAddress.base58;

  constructor(
    private readonly commonService: CommonService,

    @InjectRepository(VoteLog)
    private readonly voteLogs: Repository<VoteLog>,
    @InjectRepository(StakeLog)
    private readonly stakeLogs: Repository<StakeLog>,
    @InjectRepository(Ledger)
    private readonly ledger: Repository<Ledger>,
    @InjectRepository(DistributionLog)
    private readonly distributionLogs: Repository<DistributionLog>,
    @InjectRepository(BuyTokenEvent)
    private readonly buyTokenEvents: Repository<BuyTokenEvent>,

    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async stake(amount: number, buyer: string) {
    const stakeTrx = await tronWeb.transactionBuilder.freezeBalance(
      tronWeb.toSun(amount),
      3,
      'BANDWIDTH',
    );

    const signedStakeTrx = await tronWeb.trx.sign(stakeTrx);
    const stakeReceipt: { txid: string; result: boolean } =
      await tronWeb.trx.sendRawTransaction(signedStakeTrx);

    const stakeLog = this.stakeLogs.create({
      txid: stakeReceipt.txid,
      result: stakeReceipt.result,
      amount,
    });

    await this.stakeLogs.save(stakeLog);
    const ledgerElm = await this.ledger.create({
      sender: buyer,
      amount,
    });
    await this.ledger.save(ledgerElm);

    this.voteOptimalNode();

    return {
      stakeReceipt,
    };
  }

  async voteOptimalNode() {
    const srNode = await this.commonService.getHighestApySrNode();
    const account = await tronWeb.trx.getAccount(this.walletAddress);
    if (account.frozen?.length > 0) {
      const voteAmount = tronWeb.fromSun(account.frozen[0].frozen_balance);
      const voteTrx = await tronWeb.transactionBuilder.vote({
        [srNode.address]: voteAmount,
      });

      const signedVoteTrx = await tronWeb.trx.sign(voteTrx);
      const voteReceipt: { txid: string; result: boolean } =
        await tronWeb.trx.sendRawTransaction(signedVoteTrx);

      const voteLog = this.voteLogs.create({
        txid: voteReceipt.txid,
        result: voteReceipt.result,
        amount: voteAmount,
      });

      await this.voteLogs.save(voteLog);
    }
  }

  async distributeReward() {
    const reward = await tronWeb.trx.getReward(this.walletAddress);
    const fee = Math.ceil(reward * 0.01);
    const events = await this.ledger.find();

    const totalAmountOfShare = this.getTotalAmountOfShare(events);
    const shareMap = this.getShareMap(events);

    for (const address of Object.keys(shareMap)) {
      const share = shareMap[address];
      const rewardForStaker =
        (reward - fee) * Math.floor(share / totalAmountOfShare);
      const result = await this.sendReward(address, rewardForStaker);
      const log = this.distributionLogs.create({
        ...result,
        address,
      });

      await this.distributionLogs.save(log);
    }
  }

  async withdrawReward() {
    const reward = await tronWeb.trx.getReward(this.walletAddress);
    if (reward > 0) {
      return this.withdrawBalance();
    }

    return Promise.resolve();
  }

  private withdrawBalance() {
    const isProduction = this.commonService.getIsProduction();
    return this.httpService.axiosRef
      .post(
        isProduction
          ? `${MAINNET_API_URL}/wallet/withdrawbalance`
          : `${TESTNET_API_URL}/wallet/withdrawbalance`,
        {
          owner_address: this.walletAddress,
        },
      )
      .then((d) => d.data);
  }

  private getTotalAmountOfShare(events: Ledger[]) {
    return events.reduce(
      (acc, event) =>
        acc +
        (Math.floor(Date.now() / 1000) - getUnixTime(event.createdAt)) *
          event.amount,
      0,
    );
  }

  private getShareMap(events: Ledger[]) {
    const shareMap = {};
    const group = groupBy(events, (event) => event.sender);

    for (const sender of Object.keys(group)) {
      shareMap[sender] = this.getTotalAmountOfShare(group[sender]);
    }

    return shareMap;
  }

  private async sendReward(
    address: string,
    amount: number,
  ): Promise<{ result: boolean; txId: string }> {
    const transaction = await tronWeb.transactionBuilder.sendTrx(
      address,
      amount,
    );
    const signed = await tronWeb.trx.sign(transaction);
    return tronWeb.trx.sendRawTransaction(signed).then((receipt) => ({
      result: receipt.result,
      txId: receipt.transaction.txID,
    }));
  }

  exchange = async (buyer: string, amount: string) => {
    const amountBN = new BigNumber(amount);
    const nowTimeStamp = new Date().getTime();

    const result = await this.buyTokenEvents.find({
      select: { amountOfTRX: true },
      where: {
        buyer,
        timestamp: MoreThanOrEqual(`${nowTimeStamp - 1000 * 60 * 60 * 24 * 3}`), // 72시간동안 이벤트
      },
    });

    const unableToWithdrawAmount = result.reduce(
      (prev, cur, index) => prev.plus(new BigNumber(cur.amountOfTRX)),
      new BigNumber(0),
    );

    const tokenContract = await this.commonService.getATronContact();

    const aTronBallance = await tokenContract.balanceOf(buyer).call();
    const aTronBallanceBN = new BigNumber(aTronBallance.toString());

    const validRemainAmount =
      unableToWithdrawAmount.isLessThanOrEqualTo(aTronBallanceBN);

    if (validRemainAmount) {
      // todo unstake and send tron
      // const unstakeTrx = await tronWeb.transactionBuilder.unfreezeBalance(
      //   'BANDWIDTH',
      //   this.walletAddress,
      //   this.walletAddress,
      // );
      // const signedUnstakeTrx = await tronWeb.trx.sign(unstakeTrx);
    }
  };
}
