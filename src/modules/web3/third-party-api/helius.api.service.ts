import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

/**
 * Response interface for token supply data from Helius API
 */
interface TokenSupplyResponse {
  jsonrpc: string;
  id: string;
  result: {
    context: {
      slot: number;
    };
    value: {
      amount: string;
      decimals: number;
      uiAmount: number;
      uiAmountString: string;
    };
  };
}

/**
 * Response interface for token largest accounts data from Helius API
 */
interface TokenLargestAccountsResponse {
  jsonrpc: string;
  id: string;
  result: {
    context: {
      slot: number;
    };
    value: Array<{
      address: string;
      amount: string;
      decimals: number;
      uiAmount: number;
      uiAmountString: string;
    }>;
  };
}

/**
 * Service for interacting with Helius API endpoints
 * Provides methods to fetch Solana blockchain data using Helius RPC
 */
@Injectable()
export class HeliusApiService {
  private readonly rpcUrl: string;

  /**
   * Creates an instance of HeliusApiService
   * @param configService - NestJS ConfigService for accessing environment variables
   * @param httpService - NestJS HttpService for making HTTP requests
   * @throws Error if HELIUS_SOLANA_RPC_URL is not configured
   */
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const url = this.configService.get<string>('HELIUS_SOLANA_RPC_URL');
    if (!url) {
      throw new Error('HELIUS_SOLANA_RPC_URL is not configured');
    }
    this.rpcUrl = url;
  }

  /**
   * Fetches the token supply information for a given token address
   * @param tokenAddress - The Solana token address/mint to query
   * @returns Promise containing token supply data including amount and decimals
   * @throws Error if the API request fails
   * @example
   * const supply = await heliusApiService.getTokenSupply('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
   */
  async getTokenSupply(tokenAddress: string): Promise<TokenSupplyResponse> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<TokenSupplyResponse>(
          this.rpcUrl,
          {
            jsonrpc: '2.0',
            id: 1,
            method: 'getTokenSupply',
            params: [tokenAddress],
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return data;
    } catch (error) {
      throw new Error(`Failed to get token supply: ${error.message}`);
    }
  }

  /**
   * Fetches the largest token accounts for a given token address
   * @param tokenAddress - The Solana token address/mint to query
   * @returns Promise containing an array of largest token accounts with their balances
   * @throws Error if the API request fails
   * @example
   * const accounts = await heliusApiService.getTokenLargestAccounts('3wyAj7Rt1TWVPZVteFJPLa26JmLvdb1CAKEFZm3NY75E');
   * console.log(accounts.result.value[0].uiAmount); // 7.71
   */
  async getTokenLargestAccounts(
    tokenAddress: string,
  ): Promise<TokenLargestAccountsResponse> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<TokenLargestAccountsResponse>(
          this.rpcUrl,
          {
            jsonrpc: '2.0',
            id: 1,
            method: 'getTokenLargestAccounts',
            params: [tokenAddress],
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return data;
    } catch (error) {
      throw new Error(`Failed to get token largest accounts: ${error.message}`);
    }
  }
}
