import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Headers,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { VerifyWalletDto } from '../dto/verify-wallet.dto';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { WalletAuthGuard } from '../guards/wallet-auth.guard';

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('nonce')
  @Throttle({ default: { limit: 5, ttl: 60 } }) // 5 requests per minute
  async generateNonce() {
    const nonce = await this.authService.generateNonce();
    return { nonce };
  }

  @Post('verify')
  @Throttle({ default: { limit: 10, ttl: 60 } }) // 10 requests per minute
  @UseGuards(WalletAuthGuard)
  async verifyNonce(@Headers('x-message') nonce: string) {
    await this.authService.verifyNonce(nonce);
    return { success: true };
  }
}
