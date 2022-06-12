import * as TronWeb from 'tronweb';

export const tronWeb = new TronWeb({
  //todo testnet setting
  fullHost: 'https://api.trongrid.io',
  headers: { 'TRON-PRO-API-KEY': '4b520fa9-f3b9-4499-bf33-8c385a83cf51' },
  privateKey:
    '5bd88e7784d1c43a477ecd622f9339617a12d0ec4fc39057c128f2292920adcb',
});

export const getAtronContract = () => tronWeb.contract().at('ERC20_ADDRESS');
