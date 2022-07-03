import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { tronWeb } from 'src/tronweb/tronweb.common';
import {
  MAINNET_DEX_CONTRACT_ADDRESS,
  MAINNET_TRONSCAN_WITNESS_API_URL,
  TESTNET_DEX_CONTRACT_ADDRESS,
  TESTNET_TRONSCAN_WITNESS_API_URL,
} from './common.setting';

@Injectable()
export class CommonService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  getIsProduction() {
    return this.configService.get('NODE_ENV') === 'production';
  }

  getDexContractAddress() {
    return this.getIsProduction()
      ? MAINNET_DEX_CONTRACT_ADDRESS
      : TESTNET_DEX_CONTRACT_ADDRESS;
  }

  getDexContact() {
    const dexAddress = this.getDexContractAddress();
    return tronWeb.contract().at(dexAddress);
  }

  // export const getAtronContract = () => tronWeb.contract().at('ERC20_ADDRESS');

  async getHighestApySrNode() {
    const response = await this.httpService.axiosRef.get(
      this.getIsProduction()
        ? MAINNET_TRONSCAN_WITNESS_API_URL
        : TESTNET_TRONSCAN_WITNESS_API_URL,
    );

    const sortedSRList = response.data.data.sort(
      (a, b) => Number(b.annualizedRate) - Number(a.annualizedRate),
    );

    const srNode = sortedSRList[0];

    return srNode;
  }
}
