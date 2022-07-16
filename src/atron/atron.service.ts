import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonService } from 'src/common/common.service';
import { tronWeb } from 'src/tronweb/tronweb.common';
import { Repository } from 'typeorm';
import { StakeLog } from './entities/stake-log.entity';
import { VoteLog } from './entities/vote-log.entity';
import { Vote } from './entities/vote.entity';
import { Ledger } from './entities/ledger.entity';
import { groupBy } from 'lodash';
import { getUnixTime } from 'date-fns';
import { DistributionLog } from './entities/distribution.log';
import {
  MAINNET_TRONSCAN_WITNESS_API_URL,
  TESTNET_TRONSCAN_WITNESS_API_URL,
} from '../common/common.setting';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AtronService {
  // ? claim rewards
  // tronWeb.transactionBuilder.withdrawBlockRewards(SR_ADDRESS)
  // ? unstake
  // tronWeb.transactionBuilder.unfreezeBalance("BANDWIDTH","41BF97A54F4B829C4E9253B26024B1829E1A3B1120","41BF97A54F4B829C4E9253B26024B1829E1A3B1120",1).then(result=>console.log(result))

  /**
   * Atron 발급을 하면 해당 트랜잭션을 아이디로 stake를 한다.
   * stake를 한 수량만큼 vote를 한다 (수수료 발생)
   *
   * Atron을 트론으로 바꿀시
   * ustake를 하고 이자율 만큼 tron을 보낸다. 보유하고 있는 트론이 적으면 claim을 한다.
   * 다시 stake는 하지 않는나.
   *
   */

  private readonly walletAddress = tronWeb.defaultAddress.base58;

  constructor(
    private readonly commonService: CommonService,
    @InjectRepository(Vote)
    private readonly vote: Repository<Vote>,
    @InjectRepository(VoteLog)
    private readonly voteLogs: Repository<VoteLog>,
    @InjectRepository(StakeLog)
    private readonly stakeLogs: Repository<StakeLog>,
    @InjectRepository(Ledger)
    private readonly ledger: Repository<Ledger>,
    @InjectRepository(DistributionLog)
    private readonly distributionLogs: Repository<DistributionLog>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async stake(amount: number, buyer: string) {
    const srNode = await this.commonService.getHighestApySrNode();

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

    const voteList = await this.vote.find();
    let vote: Vote;
    if (voteList.length === 0) vote = this.vote.create({ amount: 0 });
    else vote = voteList[0];

    vote.amount += Number(amount);

    await this.vote.save(vote);

    const voteTrx = await tronWeb.transactionBuilder.vote({
      [srNode.address]: vote.amount,
    });

    const signedVoteTrx = await tronWeb.trx.sign(voteTrx);
    const voteReceipt: { txid: string; result: boolean } =
      await tronWeb.trx.sendRawTransaction(signedVoteTrx);

    const voteLog = this.voteLogs.create({
      txid: voteReceipt.txid,
      result: voteReceipt.result,
      amount: vote.amount,
    });

    await this.voteLogs.save(voteLog);

    return {
      stakeReceipt,
      voteReceipt,
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
          ? MAINNET_TRONSCAN_WITNESS_API_URL
          : TESTNET_TRONSCAN_WITNESS_API_URL,
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

  async unStake(amount: number) {
    // check be abled stake?
    // 3일 안지난 토큰 수량 체크 (컨트랙트에서 하기로 했는데?)

    // 궁금?
    const unStakeResult = await tronWeb.transactionBuilder
      .unfreezeBalance(
        'BANDWIDTH',
        this.walletAddress,
        this.walletAddress,
        amount,
      )
      .then((result) => console.log(result));

    // todo 송금하기 보유량이 송금수량보다 적으면 claim하기
    // 남은 수량을 재 스테이킹은 나중에 정책부터 정해야함
    const claimResult = await tronWeb.transactionBuilder.withdrawBlockRewards();
  }

  // //todo sr
  // @Cron('0 0 0/6 1/1 * *')
  // vote() {
  //   console.log('vote');
  // }
}
