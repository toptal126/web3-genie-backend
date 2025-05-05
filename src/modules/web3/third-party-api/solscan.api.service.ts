import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

interface SolscanPriceResponse {
  success: boolean;
  data: Array<{
    date: number;
    price: number;
  }>;
  metadata: Record<string, any>;
}

@Injectable()
export class SolscanApiService {
  private readonly apiClient: AxiosInstance;
  private readonly apiKey: string;
  private readonly baseUrl = 'https://pro-api.solscan.io/v2.0';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('SOLSCAN_API_KEY')!;
    if (!this.apiKey) {
      throw new Error('SOLSCAN_API_KEY is not configured');
    }

    this.apiClient = axios.create({
      baseURL: this.baseUrl,
      headers: {
        token: this.apiKey,
      },
    });
  }

  /**
   * Get token price data
   * @param address Token address on Solana blockchain
   * @param fromTime Optional start time filter (YYYYMMDD)
   * @param toTime Optional end time filter (YYYYMMDD)
   */
  async getTokenPrice(
    address: string,
    fromTime?: number,
    toTime?: number,
  ): Promise<number> {
    try {
      const response = await this.apiClient.get<SolscanPriceResponse>(
        '/token/price',
        {
          params: {
            address,
            ...(fromTime && { from_time: fromTime }),
            ...(toTime && { to_time: toTime }),
          },
        },
      );

      if (!response.data.success || !response.data.data?.[0]?.price) {
        throw new Error('No price data available');
      }

      return response.data.data[0].price;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Failed to fetch token price: ${error.response?.data?.message || error.message}`,
        );
      }
      throw error;
    }
  }

  /**
   * Get token markets data
   * @param page Page number
   * @param pageSize Number of items per page
   */
  async getTokenMarkets(page: number = 1, pageSize: number = 10) {
    try {
      const response = await this.apiClient.get('/token/markets', {
        params: {
          page: page.toString(),
          page_size: pageSize.toString(),
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Failed to fetch token markets: ${error.response?.data?.message || error.message}`,
        );
      }
      throw error;
    }
  }
}
