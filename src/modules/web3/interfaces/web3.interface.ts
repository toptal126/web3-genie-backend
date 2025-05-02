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
