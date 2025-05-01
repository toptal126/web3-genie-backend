import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '@user/schemas/user.schema';
import { WalletSession } from '@auth/entities/wallet-session.entity';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(WalletSession.name)
    private walletSessionModel: Model<WalletSession>,
  ) {}

  async generateNonce(): Promise<string> {
    const nonce = randomBytes(32).toString('hex');
    return nonce;
  }

  async findOrCreateUser(walletAddress: string): Promise<User> {
    let user = await this.userModel.findOne({ walletAddress }).exec();

    if (!user) {
      user = await this.userModel.create({
        walletAddress,
        username: `user_${walletAddress.slice(0, 8)}`,
      });
    }

    return user;
  }
}
