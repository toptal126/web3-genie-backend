import { Injectable } from '@nestjs/common';
import { EvmService } from './evm/evm.service';
import { SolanaService } from './solana/solana.service';
import { SystemConfigModel } from '../database/models/system-config.model';
import {
  Network,
  TokenPriceResponse,
  TokenVolumeResponse,
  Web3ServiceInterface,
  NetworkType,
  NetworkName,
} from './interfaces/web3.interface';

@Injectable()
export class Web3Service implements Web3ServiceInterface {
  constructor(
    private evmService: EvmService,
    private solanaService: SolanaService,
    private systemConfigModel: SystemConfigModel,
  ) {}

  async isWeb3Enabled() {
    const value = await this.systemConfigModel.get('web3_enabled');
    return value === 'true';
  }

  async getTokenPrice(
    token: string,
    network: Network,
  ): Promise<TokenPriceResponse> {
    if (!(await this.isWeb3Enabled())) {
      throw new Error('Web3 features are disabled');
    }

    if (network.type === NetworkType.EVM) {
      return this.evmService.getTokenPrice(token, network.name as NetworkName);
    } else if (network.type === NetworkType.SOLANA) {
      return this.solanaService.getTokenPrice(
        token,
        network.name as NetworkName,
      );
    } else {
      throw new Error(`Unsupported network: ${network.name}`);
    }
  }

  async getTokenVolume(
    token: string,
    network: Network,
  ): Promise<TokenVolumeResponse> {
    if (!(await this.isWeb3Enabled())) {
      throw new Error('Web3 features are disabled');
    }

    if (network.type === NetworkType.EVM) {
      return this.evmService.getTokenVolume(token, network.name as NetworkName);
    } else if (network.type === NetworkType.SOLANA) {
      return this.solanaService.getTokenVolume(token, network);
    } else {
      throw new Error(`Unsupported network: ${network.name}`);
    }
  }

  // Function definitions for OpenAI function calling
  getFunctionDefinitions() {
    return [
      {
        name: 'getTokenPrice',
        description: 'Get the current price of a cryptocurrency token',
        parameters: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              description: 'The token symbol (e.g., BTC, ETH, SOL)',
            },
            network: {
              type: 'string',
              description: 'The blockchain network (e.g., evm, solana)',
            },
          },
          required: ['token', 'network'],
        },
      },
      {
        name: 'getTokenVolume',
        description: 'Get the 24h trading volume of a cryptocurrency token',
        parameters: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              description: 'The token symbol (e.g., BTC, ETH, SOL)',
            },
            network: {
              type: 'string',
              description: 'The blockchain network (e.g., evm, solana)',
            },
          },
          required: ['token', 'network'],
        },
      },
    ];
  }
}
