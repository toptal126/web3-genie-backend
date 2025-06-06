import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WalletSession } from './entities/wallet-session.entity';
import { VerifyWalletDto } from './dto/verify-wallet.dto';
import { v4 as uuidv4 } from 'uuid';
import { PublicKey } from '@solana/web3.js';
import * as nacl from 'tweetnacl';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(WalletSession.name)
    private walletSessionModel: Model<WalletSession>,
  ) {}

  async findSessionByWalletAddress(
    walletAddress: string,
  ): Promise<WalletSession | null> {
    return this.walletSessionModel.findOne({
      wallet_address: walletAddress,
      is_used: false,
      expires_at: { $gt: new Date() },
    });
  }

  async generateNonce(walletAddress: string): Promise<string> {
    const nonce = uuidv4();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    // First, try to find an existing session
    const existingSession = await this.walletSessionModel.findOne({
      wallet_address: walletAddress,
    });

    if (existingSession) {
      // Update the existing session
      existingSession.nonce = nonce;
      existingSession.expires_at = expiresAt;
      existingSession.is_used = false;
      await existingSession.save();
      return nonce;
    }

    // If no existing session, create a new one
    const newSession = await this.walletSessionModel.create({
      wallet_address: walletAddress,
      nonce,
      expires_at: expiresAt,
      is_used: false,
    });

    return newSession.nonce;
  }

  async verifySignature(
    dto: VerifyWalletDto,
  ): Promise<{ walletAddress: string }> {
    const session = await this.walletSessionModel.findOne({
      nonce: dto.nonce,
    });

    if (!session || session.is_used || new Date() > session.expires_at) {
      throw new BadRequestException('Invalid or expired nonce');
    }

    try {
      const publicKey = new PublicKey(dto.walletAddress);
      const message = new TextEncoder().encode(dto.nonce);
      const signature = Buffer.from(dto.signedNonce, 'base64');

      const isValid = nacl.sign.detached.verify(
        message,
        signature,
        publicKey.toBytes(),
      );

      if (!isValid) {
        throw new UnauthorizedException('Invalid signature');
      }

      // Mark the nonce as used
      await this.walletSessionModel.findByIdAndUpdate(session._id, {
        is_used: true,
      });

      return { walletAddress: dto.walletAddress };
    } catch (error) {
      throw new UnauthorizedException('Invalid signature');
    }
  }

  async verifyNonce(nonce: string): Promise<boolean> {
    const session = await this.walletSessionModel.findOne({ nonce });
    if (!session || session.is_used || new Date() > session.expires_at) {
      throw new BadRequestException('Invalid or expired nonce');
    }
    await this.walletSessionModel.findByIdAndUpdate(session._id, {
      is_used: true,
    });
    return true;
  }

  async cleanupExpiredSessions(): Promise<void> {
    await this.walletSessionModel.deleteMany({
      expires_at: { $lt: new Date() },
    });
  }
}
