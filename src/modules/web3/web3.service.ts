import { Injectable } from '@nestjs/common';
import { EvmService } from './evm/evm.service';
import { SolanaService } from './solana/solana.service';
import { SystemConfigModel } from '../database/models/system-config.model';

@Injectable()
export class Web3Service {
  constructor(
    private evmService: EvmService,
    private solanaService: SolanaService,
    private systemConfigModel: SystemConfigModel,
  ) {}

  async isWeb3Enabled() {
    const value = await this.systemConfigModel.get('web3_enabled');
    return value === 'true';
  }

  async getTokenPrice(token: string, network: string) {
    if (!(await this.isWeb3Enabled())) {
      throw new Error('Web3 features are disabled');
    }

    if (
      network.toLowerCase() === 'evm' ||
      network.toLowerCase() === 'ethereum'
    ) {
      return this.evmService.getTokenPrice(token);
    } else if (network.toLowerCase() === 'solana') {
      return this.solanaService.getTokenPrice(token);
    } else {
      throw new Error(`Unsupported network: ${network}`);
    }
  }

  async getTokenVolume(token: string, network: string) {
    if (!(await this.isWeb3Enabled())) {
      throw new Error('Web3 features are disabled');
    }

    if (
      network.toLowerCase() === 'evm' ||
      network.toLowerCase() === 'ethereum'
    ) {
      return this.evmService.getTokenVolume(token);
    } else if (network.toLowerCase() === 'solana') {
      return this.solanaService.getTokenVolume(token);
    } else {
      throw new Error(`Unsupported network: ${network}`);
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
