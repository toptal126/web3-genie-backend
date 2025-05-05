import { Injectable } from '@nestjs/common';
import { Alchemy, Network as AlchemyNetwork } from 'alchemy-sdk';
import { ConfigService } from '@nestjs/config';
import { NETWORKS, NetworkType } from '../interfaces/web3.interface';
import axios from 'axios';

interface AlchemyPriceResponse {
  data: Array<{
    network: string;
    address: string;
    prices: Array<{
      currency: string;
      value: string;
      lastUpdatedAt: string;
    }>;
  }>;
}

@Injectable()
export class AlchemyApiService {
  private alchemyInstances: Map<AlchemyNetwork, Alchemy>;
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('ALCHEMY_API_KEY');
    if (!apiKey) {
      throw new Error('ALCHEMY_API_KEY is not configured');
    }
    this.apiKey = apiKey;
    this.baseUrl = `https://api.g.alchemy.com/prices/v1/${this.apiKey}`;

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

  async getTokenPriceByAddress(
    address: string,
    network: AlchemyNetwork,
  ): Promise<number> {
    const response = await axios.post<AlchemyPriceResponse>(
      `${this.baseUrl}/tokens/by-address`,
      {
        addresses: [
          {
            network,
            address,
          },
        ],
      },
      {
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
        },
      },
    );

    if (!response.data.data?.[0]?.prices?.[0]?.value) {
      throw new Error('No price data available');
    }

    return parseFloat(response.data.data[0].prices[0].value);
  }

  async getTokenPricesByAddresses(
    addresses: { network: AlchemyNetwork; address: string }[],
  ): Promise<Record<string, number>> {
    const prices: Record<string, number> = {};

    try {
      const response = await axios.post<AlchemyPriceResponse>(
        `${this.baseUrl}/tokens/by-address`,
        {
          addresses: addresses.map(({ network, address }) => ({
            network,
            address,
          })),
        },
        {
          headers: {
            accept: 'application/json',
            'content-type': 'application/json',
          },
        },
      );

      response.data.data.forEach((item) => {
        if (item.prices?.[0]?.value) {
          prices[item.address] = parseFloat(item.prices[0].value);
        } else {
          prices[item.address] = 0;
        }
      });
    } catch (error) {
      console.error(`Failed to fetch prices: ${error.message}`);
      throw error;
    }

    return prices;
  }
}
