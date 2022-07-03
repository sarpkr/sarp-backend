import { Injectable } from '@nestjs/common';
import { CommonService } from 'src/common/common.service';
import { tronWeb } from 'src/tronweb/tronweb.common';

@Injectable()
export class AtronService {
  // ? claim rewards
  // tronWeb.transactionBuilder.withdrawBlockRewards(SR_ADDRESS)
  // ? get SR info api
  // https://apilist.tronscan.org/api/vote/witness
  // ? stake
  // tronWeb.transactionBuilder.freezeBalance(tronWeb.toSun(100), 3, "ENERGY", "4115B95D2D2CBCE1B815BA4D2711A3BEA02CBB37F3", "4115B95D2D2CBCE1B815BA4D2711A3BEA02CBB37F3", 1).then(result => console.log(result));
  // ? unstake
  // tronWeb.transactionBuilder.unfreezeBalance("BANDWIDTH","41BF97A54F4B829C4E9253B26024B1829E1A3B1120","41BF97A54F4B829C4E9253B26024B1829E1A3B1120",1).then(result=>console.log(result))
  // ? vote
  // tronWeb.transactionBuilder.vote({"TGj1Ej1qRzL9feLTLhjwgxXF4Ct6GTWg2U":1,"TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH":1},"TTSFjEG3Lu9WkHdp4JrWYhbGP6K1REqnGQ",1).then(result=>console.log(result))
  // ? database 필요하겠는걸?

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

  constructor(private readonly commonService: CommonService) {}

  async stake(amount: number, userAddress: string) {
    // todo 돈을 찾아오기 또는 송금 받기

    const srNode = await this.commonService.getHighestApySrNode();

    const stakeResult = await tronWeb.transactionBuilder.freezeBalance(
      tronWeb.toSun(amount),
      3,
      'BANDWIDTH',
      this.walletAddress,
      this.walletAddress,
      1,
    );

    const voteResult = await tronWeb.transactionBuilder
      .vote(
        {
          [srNode.address]: 1,
        },
        this.walletAddress,
        1,
      )
      .then((result) => console.log(result));

    console.log(srNode, this.walletAddress);
    // todo db에 내역 저장
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
