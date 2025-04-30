import { Injectable } from '@nestjs/common';
import { NetworkName } from '../interfaces/web3.interface';
import {
  TokenPriceResponse,
  TokenVolumeResponse,
} from '../interfaces/web3.interface';
import { AlchemyService } from '../alchemy/alchemy.service';

@Injectable()
export class EvmService {
  constructor(private alchemyService: AlchemyService) {}

  async getTokenPrice(
    token: string,
    network: NetworkName,
  ): Promise<TokenPriceResponse> {
    try {
      const price = await this.alchemyService.getTokenPriceByAddress(
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
    network: NetworkName,
  ): Promise<TokenVolumeResponse> {
    // TODO: Implement EVM token volume fetching
    throw new Error('Not implemented');
  }
}
