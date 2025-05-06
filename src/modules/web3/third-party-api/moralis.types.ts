export interface MoralisTokenHoldersResponse {
  totalHolders: number;
  holdersByAcquisition: {
    swap: number;
    transfer: number;
    airdrop: number;
  };
  holderChange: {
    [key: string]: {
      change: number;
      changePercent: number;
    };
  };
  holderDistribution: {
    whales: number;
    sharks: number;
    dolphins: number;
    fish: number;
    octopus: number;
    crabs: number;
    shrimps: number;
  };
  holderSupply: {
    [key: string]: {
      supply: string;
      supplyPercent: number;
    };
  };
}

export interface MoralisTokenAnalyticsResponse {
  tokenAddress: string;
  totalBuyVolume: {
    '5m': number;
    '1h': number;
    '6h': number;
    '24h': number;
  };
  totalSellVolume: {
    '5m': number;
    '1h': number;
    '6h': number;
    '24h': number;
  };
  totalBuyers: {
    '5m': number;
    '1h': number;
    '6h': number;
    '24h': number;
  };
  totalSellers: {
    '5m': number;
    '1h': number;
    '6h': number;
    '24h': number;
  };
  totalBuys: {
    '5m': number;
    '1h': number;
    '6h': number;
    '24h': number;
  };
  totalSells: {
    '5m': number;
    '1h': number;
    '6h': number;
    '24h': number;
  };
  totalLiquidityUsd: string;
  totalFullyDilutedValuation: string;
}
