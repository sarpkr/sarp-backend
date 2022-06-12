import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';

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

  //todo sr
  @Interval(6 * 60 * 60 * 1000)
  vote() {
    console.log('vote');
  }
}
