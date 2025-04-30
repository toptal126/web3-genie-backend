import { Injectable } from '@nestjs/common';
import { Alchemy, Network as AlchemyNetwork } from 'alchemy-sdk';
import { ConfigService } from '@nestjs/config';
import {
  NetworkName,
  NETWORKS,
  NetworkType,
} from '../interfaces/web3.interface';

@Injectable()
export class AlchemyService {
  private alchemyInstances: Map<NetworkName, Alchemy>;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('ALCHEMY_API_KEY');
    if (!apiKey) {
      throw new Error('ALCHEMY_API_KEY is not configured');
    }

    this.alchemyInstances = new Map();

    // Initialize Alchemy instances for different networks
    NETWORKS.forEach((network) => {
      if (network.type === NetworkType.EVM) {
        this.alchemyInstances.set(
          network.name,
          new Alchemy({
            apiKey,
            network: network.alchemyNetwork,
          }),
        );
      }
    });
  }

  private getAlchemyInstance(network: NetworkName): Alchemy {
    const instance = this.alchemyInstances.get(network);
    if (!instance) {
      throw new Error(`Unsupported network: ${network}`);
    }
    return instance;
  }

  private getNetworkConfig(network: NetworkName) {
    const config = NETWORKS.find((n) => n.name === network);
    if (!config) {
      throw new Error(`Unsupported network: ${network}`);
    }
    return config;
  }

  async getTokenPriceByAddress(
    address: string,
    network: NetworkName,
  ): Promise<number> {
    try {
      const alchemy = this.getAlchemyInstance(network);
      const networkConfig = this.getNetworkConfig(network);
      const response = await alchemy.prices.getTokenPriceByAddress([
        {
          address,
          network: networkConfig.alchemyNetwork,
        },
      ]);

      const priceData = response[address];
      if (!priceData) {
        throw new Error(`No price data found for token ${address}`);
      }

      return priceData.price;
    } catch (error) {
      throw new Error(`Failed to fetch token price: ${error.message}`);
    }
  }

  async getTokenPricesByAddresses(
    addresses: string[],
    network: NetworkName,
  ): Promise<Record<string, number>> {
    try {
      const alchemy = this.getAlchemyInstance(network);
      const networkConfig = this.getNetworkConfig(network);
      const response = await alchemy.prices.getTokenPriceByAddress(
        addresses.map((address) => ({
          address,
          network: networkConfig.alchemyNetwork,
        })),
      );

      return Object.entries(response).reduce(
        (acc, [address, data]) => {
          acc[address] = data.price;
          return acc;
        },
        {} as Record<string, number>,
      );
    } catch (error) {
      throw new Error(`Failed to fetch token prices: ${error.message}`);
    }
  }
}
