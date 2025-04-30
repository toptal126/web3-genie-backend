import { Network as AlchemyNetwork } from 'alchemy-sdk';

export enum NetworkName {
  SOLANA = 'solana',
  ETHEREUM = 'ethereum',
  BSC = 'bsc',
  POLYGON = 'polygon',
}

export enum NetworkType {
  SOLANA = 'solana',
  EVM = 'evm',
}

export type Network = {
  name: NetworkName;
  type: NetworkType;
  alchemyNetwork: AlchemyNetwork;
};

export const NETWORKS: Network[] = [
  {
    name: NetworkName.SOLANA,
    type: NetworkType.SOLANA,
    alchemyNetwork: AlchemyNetwork.SOLANA_MAINNET,
  },
  {
    name: NetworkName.ETHEREUM,
    type: NetworkType.EVM,
    alchemyNetwork: AlchemyNetwork.ETH_MAINNET,
  },
  {
    name: NetworkName.BSC,
    type: NetworkType.EVM,
    alchemyNetwork: AlchemyNetwork.BNB_MAINNET,
  },
  {
    name: NetworkName.POLYGON,
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

export interface Web3ServiceInterface {
  isWeb3Enabled(): Promise<boolean>;
  getTokenPrice(token: string, network: Network): Promise<TokenPriceResponse>;
  getTokenVolume(token: string, network: Network): Promise<TokenVolumeResponse>;
}
