import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class EvmService {
  private readonly COINGECKO_API = 'https://api.coingecko.com/api/v3';
  
  // Token symbol to CoinGecko ID mapping
  private readonly tokenIdMap = {
    'eth': 'ethereum',
    'btc': 'bitcoin',
    'usdt': 'tether',
    'usdc': 'usd-coin',
    // Add more tokens as needed
  };

  async getTokenPrice(symbol: string): Promise<any> {
    try {
      const tokenId = this.getTokenId(symbol);
      const response = await axios.get(`${this.COINGECKO_API}/simple/price`, {
        params: {
          ids: tokenId,
          vs_currencies: 'usd',
          include_24hr_change: true,
        },
      });

      if (!response.data[tokenId]) {
        throw new HttpException('Token not found', HttpStatus.NOT_FOUND);
      }

      return {
        symbol: symbol.toUpperCase(),
        price: response.data[tokenId].usd,
        change24h: response.data[tokenId].usd_24h_change,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Failed to fetch token price',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getTokenVolume(symbol: string): Promise<any> {
    try {
      const tokenId = this.getTokenId(symbol);
      const response = await axios.get(
        `${this.COINGECKO_API}/coins/${tokenId}/market_chart`,
        {
          params: {
            vs_currency: 'usd',
            days: 1,
          },
        },
      );

      // Calculate 24h volume from the data
      const volumes = response.data.total_volumes;
      const volume24h = volumes.reduce((sum, [_, volume]) => sum + volume, 0);

      return {
        symbol: symbol.toUpperCase(),
        volume24h,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to fetch token volume',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private getTokenId(symbol: string): string {
    const normalizedSymbol = symbol.toLowerCase();
    const tokenId = this.tokenIdMap[normalizedSymbol];
    
    if (!tokenId) {
      throw new HttpException('Unsupported token', HttpStatus.BAD_REQUEST);
    }
    
    return tokenId;
  }
}