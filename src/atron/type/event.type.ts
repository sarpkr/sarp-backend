type CommonEventType<T> = {
  block: number;
  timestamp: number;
  contract: string;
  name: string;
  transaction: string;
  result: T;
  resourceNode: string;
};

export type ExchangeTokenEventType = CommonEventType<{
  buyer: string;
  tokenAmountToExchange: string;
}>;

export type BuyTokenEventType = CommonEventType<{
  amountOfTokens: string;
  amountOfTRX: string;
  buyer: string;
}>;
