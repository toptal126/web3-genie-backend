import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SolanaService {
  private readonly COINGECKO_API = 'https://api.coingecko.com/api/v3';
  private readonly SOLANA_RPC_ENDPOINT = 'https://api.mainnet-beta.solana.com';

  /**
   * Get token price from CoinGecko API
   * @param tokenId The CoinGecko token ID (e.g., 'solana')
   * @param currency The currency to convert to (default: 'usd')
   */
  async getTokenPrice(tokenId: string, currency: string = 'usd'): Promise<any> {
    try {
      const response = await axios.get(`${this.COINGECKO_API}/simple/price`, {
        params: {
          ids: tokenId,
          vs_currencies: currency,
        },
      });

      if (!response.data[tokenId]) {
        throw new HttpException(
          `Token ${tokenId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        tokenId,
        price: response.data[tokenId][currency],
        currency,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to fetch token price: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get Solana token market data
   * @param tokenId The CoinGecko token ID
   */
  async getTokenMarketData(tokenId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.COINGECKO_API}/coins/${tokenId}?localization=false&tickers=false&community_data=false&developer_data=false`,
      );

      return {
        name: response.data.name,
        symbol: response.data.symbol,
        current_price: response.data.market_data.current_price.usd,
        market_cap: response.data.market_data.market_cap.usd,
        total_volume: response.data.market_data.total_volume.usd,
        price_change_percentage_24h:
          response.data.market_data.price_change_percentage_24h,
        last_updated: response.data.last_updated,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to fetch token market data: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get token trading volume data
   * @param tokenId The CoinGecko token ID
   * @param days Number of days of data to retrieve (default: 1)
   */
  async getTokenVolume(tokenId: string, days: number = 1): Promise<any> {
    try {
      const response = await axios.get(
        `${this.COINGECKO_API}/coins/${tokenId}/market_chart`,
        {
          params: {
            vs_currency: 'usd',
            days: days,
            interval: days <= 1 ? 'hourly' : 'daily',
          },
        },
      );

      // Extract volume data from response
      const volumeData = response.data.total_volumes.map((item) => ({
        timestamp: item[0],
        volume: item[1],
      }));

      // Calculate total and average volume
      const totalVolume = volumeData.reduce(
        (sum, item) => sum + item.volume,
        0,
      );
      const avgVolume = totalVolume / volumeData.length;

      return {
        tokenId,
        days,
        volumeData,
        totalVolume,
        avgVolume,
        dataPoints: volumeData.length,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to fetch token volume data: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get Solana account information
   * @param address The Solana account address
   */
  async getAccountInfo(address: string): Promise<any> {
    try {
      const response = await axios.post(this.SOLANA_RPC_ENDPOINT, {
        jsonrpc: '2.0',
        id: 1,
        method: 'getAccountInfo',
        params: [address, { encoding: 'jsonParsed' }],
      });

      if (response.data.error) {
        throw new HttpException(
          `RPC Error: ${response.data.error.message}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      return response.data.result;
    } catch (error) {
      throw new HttpException(
        `Failed to fetch account info: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get Solana transaction details
   * @param signature The transaction signature
   */
  async getTransaction(signature: string): Promise<any> {
    try {
      const response = await axios.post(this.SOLANA_RPC_ENDPOINT, {
        jsonrpc: '2.0',
        id: 1,
        method: 'getTransaction',
        params: [signature, { encoding: 'jsonParsed' }],
      });

      if (response.data.error) {
        throw new HttpException(
          `RPC Error: ${response.data.error.message}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      return response.data.result;
    } catch (error) {
      throw new HttpException(
        `Failed to fetch transaction: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
