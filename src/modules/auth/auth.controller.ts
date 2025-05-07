import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Headers,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { WalletAuthGuard } from './guards/wallet-auth.guard';
import { UserService } from '../user/user.service';
import { SolanaService } from '../web3/solana/solana.service';
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly solanaService: SolanaService,
  ) {}

  @Get('nonce')
  @Throttle({ default: { limit: 5, ttl: 60 } }) // 5 requests per minute
  async generateNonce(@Headers('x-wallet-address') walletAddress: string) {
    if (!walletAddress) {
      throw new UnauthorizedException('Wallet address is required');
    }

    // Validate wallet address format
    if (!this.solanaService.checkValidSolanaAddress(walletAddress)) {
      throw new BadRequestException('Invalid wallet address format');
    }

    // Check for existing nonce
    const existingSession =
      await this.authService.findSessionByWalletAddress(walletAddress);
    if (existingSession && !existingSession.is_used) {
      return { nonce: existingSession.nonce };
    }

    // Generate new nonce
    const nonce = await this.authService.generateNonce(walletAddress);
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
