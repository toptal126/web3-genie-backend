import { Network as AlchemyNetwork } from 'alchemy-sdk';

export enum NetworkType {
  SOLANA = 'solana',
  EVM = 'evm',
}

export type Network = {
  name: AlchemyNetwork;
  type: NetworkType;
  alchemyNetwork: AlchemyNetwork;
};

export const NETWORKS: Network[] = [
  {
    name: AlchemyNetwork.SOLANA_MAINNET,
    type: NetworkType.SOLANA,
    alchemyNetwork: AlchemyNetwork.SOLANA_MAINNET,
  },
  {
    name: AlchemyNetwork.ETH_MAINNET,
    type: NetworkType.EVM,
    alchemyNetwork: AlchemyNetwork.ETH_MAINNET,
  },
  {
    name: AlchemyNetwork.BNB_MAINNET,
    type: NetworkType.EVM,
    alchemyNetwork: AlchemyNetwork.BNB_MAINNET,
  },
  {
    name: AlchemyNetwork.MATIC_MAINNET,
    type: NetworkType.EVM,
    alchemyNetwork: AlchemyNetwork.MATIC_MAINNET,
  },
];

export interface TokenInfo {
  symbol: string;
  network: Network;
}

export interface TokenPriceResponse {
  price: number;
  currency: string;
  timestamp: number;
}

export interface TokenVolumeResponse {
  volume24h: number;
  currency: string;
  timestamp: number;
}

export interface TokenHolder {
  address: string;
  balance: number;
  percentage: number;
}

export interface TokenHoldersResponse {
  holders: TokenHolder[];
  totalHolders: number;
  timestamp: number;
}

export interface TokenHolderOptions {
  maxHolders?: number;
  minAmount?: number;
}

export interface TokenAddress {
  network: AlchemyNetwork;
  address: string;
}

export interface Web3ServiceInterface {
  getTokenPriceByAddress(
    addresses: TokenAddress[],
  ): Promise<Record<string, TokenPriceResponse>>;
  getTokenVolume(token: string, network: Network): Promise<TokenVolumeResponse>;
  getTokenHolders(
    token: string,
    network: Network,
    options?: TokenHolderOptions,
  ): Promise<TokenHoldersResponse>;
}

/**
 * Response interface for token information from Solana.fm API
 */
export interface SolanaFMTokenInfoResponse {
  tokenName: string;
  symbol: string;
  decimals: number;
  address: string;
  verified: string;
}

export interface SolscanTokenInfoResponse {
  address: string;
  name: string;
  symbol: string;
  icon: string;
  decimals: number;
  holder: number;
  creator: string;
  create_tx: string;
  created_time: number;
  first_mint_tx: string;
  first_mint_time: number;
  metadata: {
    name: string;
    symbol: string;
    description: string;
    image: string;
    showName?: boolean;
    createdOn?: string;
    twitter?: string;
    website?: string;
  };
  mint_authority: string | null;
  freeze_authority: string | null;
  supply: string;
  price: number;
  volume_24h?: number;
  market_cap: number;
  market_cap_rank?: number;
  price_change_24h?: number;
}

export interface AlchemyPriceBySymbol {
  symbol: string;
  prices: {
    currency: string;
    value: string;
    lastUpdatedAt: string;
  }[];
}
