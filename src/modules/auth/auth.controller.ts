import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('wallet')
  async authenticateWallet(@Body() body: { walletAddress: string }) {
    return this.authService.validateWalletAddress(body.walletAddress);
  }
}