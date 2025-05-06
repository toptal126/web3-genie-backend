import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Headers,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { WalletAuthGuard } from './guards/wallet-auth.guard';
import { UserService } from '../user/user.service';

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Get('nonce')
  @Throttle({ default: { limit: 5, ttl: 60 } }) // 5 requests per minute
  async generateNonce() {
    const nonce = await this.authService.generateNonce();
    return { nonce };
  }

  @Post('verify')
  @Throttle({ default: { limit: 10, ttl: 60 } }) // 10 requests per minute
  @UseGuards(WalletAuthGuard)
  async verifyNonce(
    @Headers('x-wallet-address') walletAddress: string,
    @Headers('x-message') nonce: string,
  ) {
    await this.authService.verifyNonce(nonce);
    const user = await this.userService.createUser(walletAddress);
    return { success: true, user };
  }
}
