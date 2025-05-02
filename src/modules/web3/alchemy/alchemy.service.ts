import { Injectable } from '@nestjs/common';
import { Alchemy, Network as AlchemyNetwork } from 'alchemy-sdk';
import { ConfigService } from '@nestjs/config';
import { NETWORKS, NetworkType } from '../interfaces/web3.interface';
import axios from 'axios';

@Injectable()
export class AlchemyService {
  private alchemyInstances: Map<AlchemyNetwork, Alchemy>;
  private readonly apiKey: string;
  private readonly PRICES_API_URL = 'https://api.g.alchemy.com/prices/v1';

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('ALCHEMY_API_KEY');
    if (!apiKey) {
      throw new Error('ALCHEMY_API_KEY is not configured');
    }
    this.apiKey = apiKey;

    this.alchemyInstances = new Map();

    // Initialize Alchemy instances for different networks
    NETWORKS.forEach((network) => {
      if (network.type === NetworkType.EVM) {
        this.alchemyInstances.set(
          network.name,
          new Alchemy({
            apiKey: this.apiKey,
            network: network.alchemyNetwork,
          }),
        );
      }
    });
  }

  private getAlchemyInstance(network: AlchemyNetwork): Alchemy {
    const instance = this.alchemyInstances.get(network);
    if (!instance) {
      throw new Error(`Alchemy does not support network: ${network}`);
    }
    return instance;
  }

  private getNetworkConfig(network: AlchemyNetwork) {
    const config = NETWORKS.find((n) => n.name === network);
    if (!config || config.type !== NetworkType.EVM) {
      throw new Error(
        `Alchemy only supports EVM networks. Network ${network} is not supported.`,
      );
    }
    return config;
  }

  async getTokenPriceByAddress(
    address: string,
    network: AlchemyNetwork,
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

  async getTokenPricesByAddressesV1(
    addresses: string[],
    network: AlchemyNetwork,
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

  async getTokenPricesByAddresses(
    addresses: Array<{ network: string; address: string }>,
  ): Promise<Record<string, number>> {
    try {
      const response = await axios.post(
        `${this.PRICES_API_URL}/${this.apiKey}/tokens/by-address`,
        { addresses },
        {
          headers: {
            accept: 'application/json',
            'content-type': 'application/json',
          },
        },
      );

      if (!response.data || !Array.isArray(response.data.data)) {
        throw new Error('Invalid response format from Alchemy API');
      }

      return response.data.data.reduce(
        (acc, item) => {
          if (item.prices?.[0]?.value) {
            acc[item.address] = parseFloat(item.prices[0].value);
          }
          return acc;
        },
        {} as Record<string, number>,
      );
    } catch (error) {
      throw new Error(`Failed to fetch token prices: ${error.message}`);
    }
  }
}
