import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SolanaFMTokenInfoResponse } from '../interfaces/web3.interface';

/**
 * Response interface for token supply information from Solana.fm API
 */
interface TokenSupplyResponse {
  circulatingSupply: number;
  tokenWithheldAmount: number;
  userTotalWithheldAmount: number;
  totalWithheldAmount: number;
  realCirculatingSupply: number;
  decimals: number;
}

/**
 * Service for interacting with Solana.fm API endpoints
 * Provides methods to fetch Solana token metadata and information
 */
@Injectable()
export class SolanaFMApiService {
  private readonly baseUrlV0 = 'https://api.solana.fm/v0';
  private readonly baseUrlV1 = 'https://api.solana.fm/v1';

  /**
   * Creates an instance of SolanaFMApiService
   * @param httpService - NestJS HttpService for making HTTP requests
   */
  constructor(private readonly httpService: HttpService) {}

  /**
   * Fetches detailed token information from Solana.fm API
   * @param tokenHash - The Solana token hash/mint address to query
   * @returns Promise containing token metadata including name, symbol, decimals, and other details
   * @throws Error if the API request fails
   * @example
   * const tokenInfo = await solanaFMApiService.getTokenInfo('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
   * console.log(tokenInfo.result.data.tokenName); // "USD Coin"
   */
  async getTokenInfo(
    tokenHash: string,
  ): Promise<SolanaFMTokenInfoResponse | null> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<any>(`${this.baseUrlV0}/tokens/${tokenHash}`, {
          headers: {
            accept: 'application/json',
          },
        }),
      );

      return { ...data.result.data, address: data.result.tokenHash };
    } catch (error) {
      console.error(
        `Failed to get token info from Solana.fm: ${error.message}`,
      );
      return null;
    }
  }

  /**
   * Fetches token supply information from Solana.fm API
   * @param mintAddress - The Solana token mint address to query
   * @returns Promise containing token supply data including circulating supply, withheld amounts, and decimals
   * @throws Error if the API request fails
   * @example
   * const supply = await solanaFMApiService.getTokenSupply('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
   * console.log(supply.circulatingSupply); // 99995300644040580
   */
  async getTokenSupply(mintAddress: string): Promise<TokenSupplyResponse> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<TokenSupplyResponse>(
          `${this.baseUrlV1}/tokens/mint/${mintAddress}/supply`,
          {
            headers: {
              accept: 'application/json',
            },
          },
        ),
      );

      return data;
    } catch (error) {
      throw new Error(
        `Failed to get token supply from Solana.fm: ${error.message}`,
      );
    }
  }
}
