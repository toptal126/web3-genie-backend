import { Injectable } from '@nestjs/common';
import { EvmService } from './evm/evm.service';
import { SolanaService } from './solana/solana.service';
import { SystemConfigModel } from '../database/models/system-config.model';
import { AlchemyService } from './alchemy/alchemy.service';
import {
  Network,
  TokenPriceResponse,
  TokenVolumeResponse,
  Web3ServiceInterface,
  NetworkType,
  TokenHoldersResponse,
  TokenAddress,
} from './interfaces/web3.interface';
import { Network as AlchemyNetwork } from 'alchemy-sdk';

interface TokenHolderOptions {
  maxHolders?: number;
  minAmount?: number;
}

@Injectable()
export class Web3Service implements Web3ServiceInterface {
  constructor(
    private evmService: EvmService,
    private solanaService: SolanaService,
    private systemConfigModel: SystemConfigModel,
    private alchemyService: AlchemyService,
  ) {}

  async isWeb3Enabled() {
    const value = await this.systemConfigModel.get('web3_enabled');
    return value === 'true';
  }

  async getTokenPriceByAddress(
    addresses: TokenAddress[],
  ): Promise<Record<string, TokenPriceResponse>> {
    if (!(await this.isWeb3Enabled())) {
      throw new Error('Web3 features are disabled');
    }

    const prices = await this.alchemyService.getTokenPricesByAddresses(
      addresses.map((addr) => ({
        network: addr.network,
        address: addr.address,
      })),
    );

    // Convert the price map to TokenPriceResponse format
    const result: Record<string, TokenPriceResponse> = {};
    Object.entries(prices).forEach(([address, price]) => {
      result[address] = {
        price,
        currency: 'USD',
        timestamp: Date.now(),
      };
    });

    return result;
  }

  async getTokenVolume(
    token: string,
    network: Network,
  ): Promise<TokenVolumeResponse> {
    if (!(await this.isWeb3Enabled())) {
      throw new Error('Web3 features are disabled');
    }

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
    if (!(await this.isWeb3Enabled())) {
      throw new Error('Web3 features are disabled');
    }

    if (network.type === NetworkType.EVM) {
      return this.evmService.getTokenHolders(token, network.name, options);
    } else if (network.type === NetworkType.SOLANA) {
      return this.solanaService.getTokenHolders(token, network, options);
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
