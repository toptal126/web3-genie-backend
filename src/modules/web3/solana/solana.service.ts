import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import {
  Network,
  NetworkType,
  TokenHolderOptions,
  TokenHoldersResponse,
} from '../interfaces/web3.interface';
import {
  TokenPriceResponse,
  TokenVolumeResponse,
} from '../interfaces/web3.interface';
import { Network as AlchemyNetwork } from 'alchemy-sdk';

@Injectable()
export class SolanaService {
  private readonly COINGECKO_API = 'https://api.coingecko.com/api/v3';
  private readonly SOLANA_RPC_URL = process.env.SOLANA_RPC_URL!;

  constructor() {}

  /**
   * Get token price from CoinGecko API
   * @param token The token symbol or address
   * @param network The network name
   */
  async getTokenPrice(
    token: string,
    network: AlchemyNetwork,
  ): Promise<TokenPriceResponse> {
    try {
      if (network !== AlchemyNetwork.SOLANA_MAINNET) {
        throw new Error(`Unsupported network for Solana service: ${network}`);
      }

      const response = await axios.get(`${this.COINGECKO_API}/simple/price`, {
        params: {
          ids: token,
          vs_currencies: 'usd',
        },
      });

      if (!response.data[token]) {
        throw new HttpException(
          `Token ${token} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        price: response.data[token].usd,
        currency: 'USD',
        timestamp: Date.now(),
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
   * @param token The token symbol or address
   * @param network The network name
   */
  async getTokenVolume(
    token: string,
    network: Network,
  ): Promise<TokenVolumeResponse> {
    try {
      if (network.type !== NetworkType.SOLANA) {
        throw new Error(`Unsupported network for Solana service: ${network}`);
      }

      const response = await axios.get(
        `${this.COINGECKO_API}/coins/${token}/market_chart`,
        {
          params: {
            vs_currency: 'usd',
            days: 1,
            interval: 'hourly',
          },
        },
      );

      // Extract volume data from response
      const volumeData = response.data.total_volumes.map((item) => ({
        timestamp: item[0],
        volume: item[1],
      }));

      // Calculate total volume for 24h
      const volume24h = volumeData.reduce((sum, item) => sum + item.volume, 0);

      return {
        volume24h,
        currency: 'USD',
        timestamp: Date.now(),
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
      const response = await axios.post(this.SOLANA_RPC_URL, {
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
      const response = await axios.post(this.SOLANA_RPC_URL, {
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

  /**
   * Get token holders using Solana RPC
   * @param token The token mint address
   * @param network The network object
   * @param options Optional parameters to filter holders
   */
  async getTokenHolders(
    token: string,
    network: Network,
    options: TokenHolderOptions = {},
  ): Promise<TokenHoldersResponse> {
    try {
      if (network.type !== NetworkType.SOLANA) {
        throw new Error(`Unsupported network for Solana service: ${network}`);
      }

      const { maxHolders = 1000, minAmount = 0 } = options;
      let page = 1;
      const allHolders = new Map<string, number>();

      while (true) {
        const response = await axios.post(this.SOLANA_RPC_URL, {
          jsonrpc: '2.0',
          id: 'helius-test',
          method: 'getTokenAccounts',
          params: {
            page,
            limit: 1000,
            displayOptions: {},
            mint: token,
          },
        });

        if (response.data.error) {
          throw new HttpException(
            `RPC Error: ${response.data.error.message}`,
            HttpStatus.BAD_REQUEST,
          );
        }

        const accounts = response.data.result?.token_accounts || [];
        if (accounts.length === 0) {
          break;
        }

        // Process accounts and aggregate balances by owner
        accounts.forEach((account: any) => {
          const amount = Number(account.amount);
          if (amount >= minAmount) {
            const currentBalance = allHolders.get(account.owner) || 0;
            allHolders.set(account.owner, currentBalance + amount);
          }
        });

        // Check if we've reached the desired number of holders
        if (allHolders.size >= maxHolders) {
          break;
        }

        page++;
      }

      // Convert to array and sort by balance
      const holders = Array.from(allHolders.entries())
        .map(([address, balance]) => ({
          address,
          balance,
          percentage: 0, // Will be calculated after sorting
        }))
        .sort((a, b) => b.balance - a.balance)
        .slice(0, maxHolders);

      // Calculate percentages based on total supply
      const totalSupply = holders.reduce((sum, h) => sum + h.balance, 0);
      holders.forEach((holder) => {
        holder.percentage = (holder.balance / totalSupply) * 100;
      });

      return {
        holders,
        totalHolders: allHolders.size,
        timestamp: Date.now(),
      };
    } catch (error) {
      throw new HttpException(
        `Failed to fetch token holders: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
