export type BuyTokenEventType = {
  block: number;
  timestamp: number;
  contract: string;
  name: string;
  transaction: string;
  result: {
    amountOfTokens: string;
    amountOfTRX: string;
    buyer: string;
  };
  resourceNode: string;
};
