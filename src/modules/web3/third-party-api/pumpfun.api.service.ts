import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

interface CandlestickData {
  mint: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  slot: number;
  is_5_min: boolean;
  is_1_min: boolean;
}

interface PriceStats {
  currentPrice: number;
  highPrice: number;
  lowPrice: number;
  priceChange: number;
  priceChangePercent: number;
  volume24h: number;
}

export interface BondingStatus {
  // Progress-based format
  progress?: number;

  // Graduation-based format
  mint?: string;
  graduatedAt?: string;
}

@Injectable()
export class PumpFunApiService {
  private readonly apiClient: AxiosInstance;
  private readonly baseUrl = 'https://frontend-api-v3.pump.fun';
  private readonly moralisBaseUrl = 'https://solana-gateway.moralis.io';
  private readonly moralisApiKey: string;

  constructor() {
    this.apiClient = axios.create({
      baseURL: this.baseUrl,
    });
    this.moralisApiKey = process.env.MORALIS_API_KEY || '';
    if (!this.moralisApiKey) {
      throw new Error('MORALIS_API_KEY is not configured');
    }
  }

  /**
   * Get token candlestick data
   * @param tokenAddress Token mint address
   * @param offset Offset for pagination
   * @param limit Number of records to return
   * @param timeframe Timeframe in minutes (e.g., 5 for 5-minute candles)
   */
  async getTokenCandlesticks(
    tokenAddress: string,
    offset: number = 0,
    limit: number = 1000,
    timeframe: number = 5,
  ): Promise<CandlestickData[]> {
    try {
      const response = await this.apiClient.get(
        `/candlesticks/${tokenAddress}`,
        {
          params: {
            offset,
            limit,
            timeframe,
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch token candlesticks: ${error.message}`);
    }
  }

  /**
   * Get latest token price
   * @param tokenAddress Token mint address
   */
  async getLatestTokenPrice(tokenAddress: string): Promise<number> {
    try {
      const candlesticks = await this.getTokenCandlesticks(tokenAddress, 0, 1);
      if (candlesticks.length === 0) {
        throw new Error('No price data available');
      }
      // if candlesticks [0] is old data (like 10 mins old) throw error
      // 1746467280 this is timestamp format
      if (candlesticks[0].timestamp < Date.now() / 1000 - 10 * 60) {
        throw new Error('Old price data available');
      }
      return candlesticks[0].close;
    } catch (error) {
      throw new Error(`Failed to fetch latest token price: ${error.message}`);
    }
  }

  /**
   * Get 24h price statistics
   * @param tokenAddress Token mint address
   */
  async get24hPriceStats(tokenAddress: string): Promise<PriceStats> {
    try {
      // Get last 288 5-minute candles (24 hours)
      const candlesticks = await this.getTokenCandlesticks(
        tokenAddress,
        0,
        288,
        5,
      );
      if (candlesticks.length === 0) {
        throw new Error('No price data available');
      }

      const currentPrice = candlesticks[0].close;
      const openPrice = candlesticks[candlesticks.length - 1].open;

      let highPrice = -Infinity;
      let lowPrice = Infinity;
      let volume24h = 0;

      candlesticks.forEach((candle) => {
        highPrice = Math.max(highPrice, candle.high);
        lowPrice = Math.min(lowPrice, candle.low);
        volume24h += candle.volume;
      });

      const priceChange = currentPrice - openPrice;
      const priceChangePercent = (priceChange / openPrice) * 100;

      return {
        currentPrice,
        highPrice,
        lowPrice,
        priceChange,
        priceChangePercent,
        volume24h,
      };
    } catch (error) {
      throw new Error(`Failed to fetch 24h price stats: ${error.message}`);
    }
  }

  /**
   * Get only 5-minute candles
   * @param tokenAddress Token mint address
   * @param limit Number of 5-minute candles to return
   */
  async get5MinuteCandlesticks(
    tokenAddress: string,
    limit: number = 288, // Default 24h worth of 5-min candles
  ): Promise<CandlestickData[]> {
    try {
      const candlesticks = await this.getTokenCandlesticks(
        tokenAddress,
        0,
        limit * 2,
      );
      return candlesticks.filter((candle) => candle.is_5_min);
    } catch (error) {
      throw new Error(
        `Failed to fetch 5-minute candlesticks: ${error.message}`,
      );
    }
  }

  /**
   * Get token bonding status from Moralis API
   * @param tokenAddress Token mint address
   * @returns Promise containing the token's bonding status and progress
   * @throws Error if the API request fails
   * @example
   * const status = await pumpFunApiService.getTokenBondingStatus('H9EW9whFL8syVCf6WvEN6dvMcn2c2Q6stUkMySmgpump');
   * console.log(status.bondingProgress); // 33.36274797567671
   */
  async getTokenBondingStatus(tokenAddress: string): Promise<BondingStatus> {
    try {
      const response: BondingStatus = (
        await axios.get<BondingStatus>(
          `${this.moralisBaseUrl}/token/mainnet/${tokenAddress}/bonding-status`,
          {
            headers: {
              accept: 'application/json',
              'X-API-Key': this.moralisApiKey,
            },
          },
        )
      ).data;
      if (response.graduatedAt) response.progress = 100;
      return response;
    } catch (error) {
      throw new Error(`Failed to fetch token bonding status: ${error.message}`);
    }
  }
}
