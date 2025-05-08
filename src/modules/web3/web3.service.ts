import { Injectable } from '@nestjs/common';
import { EvmService } from './evm/evm.service';
import { SolanaService } from './solana/solana.service';
import {
  Network,
  TokenPriceResponse,
  TokenVolumeResponse,
  Web3ServiceInterface,
  NetworkType,
  TokenHoldersResponse,
  TokenAddress,
  NETWORKS,
} from './interfaces/web3.interface';

interface TokenHolderOptions {
  maxHolders?: number;
  minAmount?: number;
}

@Injectable()
export class Web3Service implements Web3ServiceInterface {
  constructor(
    private evmService: EvmService,
    private solanaService: SolanaService,
  ) {}

  async getTokenPriceByAddress(
    addresses: TokenAddress[],
  ): Promise<Record<string, TokenPriceResponse>> {
    const result: Record<string, TokenPriceResponse> = {};

    // Group addresses by network type
    const evmAddresses = addresses.filter(
      (addr) =>
        NETWORKS.find((n) => n.name === addr.network)?.type === NetworkType.EVM,
    );
    const solanaAddresses = addresses.filter(
      (addr) =>
        NETWORKS.find((n) => n.name === addr.network)?.type ===
        NetworkType.SOLANA,
    );

    // Get prices from EVM service
    if (evmAddresses.length > 0) {
      for (const addr of evmAddresses) {
        const price = await this.evmService.getTokenPrice(
          addr.address,
          addr.network,
        );
        result[addr.address] = price;
      }
    }

    // Get prices from Solana service
    if (solanaAddresses.length > 0) {
      for (const addr of solanaAddresses) {
        const price = await this.solanaService.getTokenPrice(
          addr.address,
          addr.network,
        );
        result[addr.address] = price;
      }
    }

    return result;
  }

  async getTokenVolume(
    token: string,
    network: Network,
  ): Promise<TokenVolumeResponse> {
    if (network.type === NetworkType.EVM) {
      return this.evmService.getTokenVolume(token, network.name);
    } else if (network.type === NetworkType.SOLANA) {
      return this.solanaService.getTokenVolume(token, network);
    } else {
      throw new Error(`Unsupported network: ${network.name}`);
    }
  }

  async getTokenHolders(
    token: string,
    network: Network,
    options: TokenHolderOptions = {},
  ): Promise<TokenHoldersResponse> {
    if (network.type === NetworkType.EVM) {
      return this.evmService.getTokenHolders(token, network.name, options);
    } else if (network.type === NetworkType.SOLANA) {
      return this.solanaService.getTokenHolders(token, network, options);
    } else {
      throw new Error(`Unsupported network: ${network.name}`);
    }
  }
}
