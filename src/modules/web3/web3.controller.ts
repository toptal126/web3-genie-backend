import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  ValidationPipe,
} from '@nestjs/common';
import { Web3Service } from './web3.service';
import {
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Network, NETWORKS } from './interfaces/web3.interface';
import { Network as AlchemyNetwork } from 'alchemy-sdk';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

class TokenAddressDto {
  @IsEnum([
    'solana-mainnet',
    'ethereum-mainnet',
    'polygon-mainnet',
    'bsc-mainnet',
  ])
  @ApiProperty({
    description: 'Network name',
    enum: [
      'solana-mainnet',
      'ethereum-mainnet',
      'polygon-mainnet',
      'bsc-mainnet',
    ],
  })
  network: string;

  @IsString()
  @ApiProperty({ description: 'Token address' })
  address: string;
}

class TokenPriceRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TokenAddressDto)
  @ApiProperty({
    type: [TokenAddressDto],
    description: 'Array of token addresses with their networks',
  })
  addresses: TokenAddressDto[];
}

class TokenPriceQueryDto {
  @IsString()
  @ApiProperty({ description: 'Token address' })
  @Transform(({ value }) => value?.trim())
  address: string;

  @IsEnum(AlchemyNetwork)
  @ApiProperty({
    description: 'Network name',
    enum: AlchemyNetwork,
    example: AlchemyNetwork.SOLANA_MAINNET,
  })
  @Transform(({ value }) => value?.trim())
  network: AlchemyNetwork;
}

class TokenDataQueryDto {
  @IsString()
  @ApiProperty({ description: 'Token contract address' })
  @Transform(({ value }) => value?.trim())
  tokenAddress: string;

  @IsEnum(AlchemyNetwork)
  @ApiProperty({
    description: 'Network name',
    enum: AlchemyNetwork,
    example: AlchemyNetwork.SOLANA_MAINNET,
  })
  @Transform(({ value }) => value?.trim())
  network: AlchemyNetwork;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ description: 'Start date (ISO format)', required: false })
  @Transform(
    ({ value }) => {
      if (!value) {
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        return date.toISOString();
      }
      return value;
    },
    { toClassOnly: true },
  )
  startDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ description: 'End date (ISO format)', required: false })
  @Transform(
    ({ value }) => {
      if (!value) {
        return new Date().toISOString();
      }
      return value;
    },
    { toClassOnly: true },
  )
  endDate?: string;

  @IsString()
  @IsOptional()
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
  @ApiOperation({ summary: 'Get token price by address' })
  @ApiResponse({
    status: 200,
    description: 'Returns token price data',
    schema: {
      type: 'object',
      properties: {
        price: { type: 'number' },
        currency: { type: 'string' },
        timestamp: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getTokenPrice(@Query(ValidationPipe) query: TokenPriceQueryDto) {
    const network = NETWORKS.find((n) => n.name === query.network);
    if (!network) {
      throw new Error(`Unsupported network: ${query.network}`);
    }

    const result = await this.web3Service.getTokenPriceByAddress([
      { address: query.address, network: query.network },
    ]);

    return result[query.address];
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
