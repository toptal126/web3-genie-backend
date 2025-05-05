import { Injectable } from '@nestjs/common';
import { TokenHoldersResponse } from '../interfaces/web3.interface';
import {
  TokenPriceResponse,
  TokenVolumeResponse,
} from '../interfaces/web3.interface';
import { AlchemyApiService } from '../third-party-api/alchemy.api.service';
import { Network as AlchemyNetwork } from 'alchemy-sdk';

interface TokenHolderOptions {
  maxHolders?: number;
  minAmount?: number;
}

@Injectable()
export class EvmService {
  constructor(private AlchemyApiService: AlchemyApiService) {}

  async getTokenPrice(
    token: string,
    network: AlchemyNetwork,
  ): Promise<TokenPriceResponse> {
    try {
      const price = await this.AlchemyApiService.getTokenPriceByAddress(
        token,
        network,
      );
      return {
        price,
        currency: 'USD',
        timestamp: Date.now(),
      };
    } catch (error) {
      throw new Error(`Failed to fetch EVM token price: ${error.message}`);
    }
  }

  async getTokenVolume(
    token: string,
    network: AlchemyNetwork,
  ): Promise<TokenVolumeResponse> {
    // TODO: Implement EVM token volume fetching
    throw new Error('Not implemented');
  }

  async getTokenHolders(
    token: string,
    network: AlchemyNetwork,
    options: TokenHolderOptions = {},
  ): Promise<TokenHoldersResponse> {
    // Return empty response for now
    return {
      holders: [],
      totalHolders: 0,
      timestamp: Date.now(),
    };
  }
}
