import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('wallet')
  @ApiOperation({ summary: 'Authenticate user with wallet address' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        walletAddress: {
          type: 'string',
          description: "User's wallet address",
          example: '0x123...abc',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User authenticated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        walletAddress: { type: 'string' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid wallet address' })
  async authenticateWallet(@Body() body: { walletAddress: string }) {
    return this.authService.validateWalletAddress(body.walletAddress);
  }
}
