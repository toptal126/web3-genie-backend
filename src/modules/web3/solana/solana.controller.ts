import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SolanaService } from './solana.service';
import { Network as AlchemyNetwork } from 'alchemy-sdk';
import { Network, NetworkType } from '../interfaces/web3.interface';

@Controller('solana')
export class SolanaController {
  constructor(private readonly solanaService: SolanaService) {}

  @Get('token/price')
  async getTokenPrice(
    @Query('token') token: string,
    @Query('network') network: string = 'solana-mainnet',
  ) {
    if (!token) {
      throw new HttpException(
        'Token address is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.solanaService.getTokenPrice(
      token,
      AlchemyNetwork.SOLANA_MAINNET,
    );
  }

  @Get('token/market-data')
  async getTokenMarketData(@Query('tokenId') tokenId: string) {
    if (!tokenId) {
      throw new HttpException('Token ID is required', HttpStatus.BAD_REQUEST);
    }

    return this.solanaService.getTokenMarketData(tokenId);
  }

  @Get('token/volume')
  async getTokenVolume(
    @Query('token') token: string,
    @Query('network') network: string = 'solana-mainnet',
  ) {
    if (!token) {
      throw new HttpException(
        'Token address is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const networkObj: Network = {
      name: AlchemyNetwork.SOLANA_MAINNET,
      type: NetworkType.SOLANA,
      alchemyNetwork: AlchemyNetwork.SOLANA_MAINNET,
    };

    return this.solanaService.getTokenVolume(token, networkObj);
  }

  @Get('account')
  async getAccountInfo(@Query('address') address: string) {
    if (!address) {
      throw new HttpException(
        'Account address is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.solanaService.getAccountInfo(address);
  }

  @Get('transaction')
  async getTransaction(@Query('signature') signature: string) {
    if (!signature) {
      throw new HttpException(
        'Transaction signature is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.solanaService.getTransaction(signature);
  }

  @Get('token/holders')
  async getTokenHolders(
    @Query('token') token: string,
    @Query('network') network: string = 'solana-mainnet',
    @Query('maxHolders') maxHolders?: number,
    @Query('minAmount') minAmount?: number,
  ) {
    if (!token) {
      throw new HttpException(
        'Token address is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const networkObj: Network = {
      name: AlchemyNetwork.SOLANA_MAINNET,
      type: NetworkType.SOLANA,
      alchemyNetwork: AlchemyNetwork.SOLANA_MAINNET,
    };

    return this.solanaService.getTokenHolders(token, networkObj, {
      maxHolders,
      minAmount,
    });
  }
}
