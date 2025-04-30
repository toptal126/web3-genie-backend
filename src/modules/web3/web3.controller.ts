import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { Web3Service } from './web3.service';
import {
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Network, NETWORKS } from './interfaces/web3.interface';
import { IsDateString, IsEnum, IsString } from 'class-validator';

class TokenDataQueryDto {
  @IsString()
  @ApiProperty({ description: 'Token contract address' })
  tokenAddress: string;

  @IsEnum(NETWORKS.map((n) => n.name))
  @ApiProperty({ description: 'Network name (ethereum, polygon, bsc, solana)' })
  network: string;

  @IsDateString()
  @ApiProperty({ description: 'Start date (ISO format)', required: false })
  startDate?: string;

  @IsDateString()
  @ApiProperty({ description: 'End date (ISO format)', required: false })
  endDate?: string;

  @IsString()
  @ApiProperty({
    description: 'Time interval (1h, 1d, 1w, 1m)',
    required: false,
  })
  interval?: string;
}

@ApiTags('Web3')
@Controller('web3')
export class Web3Controller {
  constructor(private readonly web3Service: Web3Service) {}

  @Get('token/price')
  @ApiOperation({ summary: 'Get token price' })
  @ApiResponse({ status: 200, description: 'Returns token price data' })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getTokenPrice(@Query(ValidationPipe) query: TokenDataQueryDto) {
    const network = NETWORKS.find((n) => n.name === query.network);
    if (!network) {
      throw new Error(`Unsupported network: ${query.network}`);
    }

    return this.web3Service.getTokenPrice(query.tokenAddress, network);
  }

  @Get('token/volume')
  @ApiOperation({ summary: 'Get token volume' })
  @ApiResponse({ status: 200, description: 'Returns token volume data' })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getTokenVolume(@Query(ValidationPipe) query: TokenDataQueryDto) {
    const network = NETWORKS.find((n) => n.name === query.network);
    if (!network) {
      throw new Error(`Unsupported network: ${query.network}`);
    }

    return this.web3Service.getTokenVolume(query.tokenAddress, network);
  }

  @Get('token/history')
  @ApiOperation({ summary: 'Get token price and volume history' })
  @ApiResponse({ status: 200, description: 'Returns token historical data' })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getTokenHistory(@Query(ValidationPipe) query: TokenDataQueryDto) {
    const network = NETWORKS.find((n) => n.name === query.network);
    if (!network) {
      throw new Error(`Unsupported network: ${query.network}`);
    }

    // TODO: Implement historical data fetching
    throw new Error('Not implemented');
  }
}
