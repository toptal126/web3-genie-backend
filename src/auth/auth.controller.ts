import {
  Controller,
  Post,
  Get,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { WalletAuthGuard } from './guards/wallet-auth.guard';
import { UseGuards } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('nonce')
  async getNonce() {
    const nonce = await this.authService.generateNonce();
    return { nonce };
  }

  @Post('verify')
  @UseGuards(WalletAuthGuard)
  async verifyWallet(@Headers('x-wallet-address') walletAddress: string) {
    try {
      const user = await this.authService.findOrCreateUser(walletAddress);
      return { success: true, user };
    } catch (error) {
      throw new UnauthorizedException('Failed to verify wallet');
    }
  }
}
