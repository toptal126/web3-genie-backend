import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { PublicKey } from '@solana/web3.js';
import * as nacl from 'tweetnacl';

@Injectable()
export class WalletAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const walletAddress = request.headers['x-wallet-address'];
    const signature = request.headers['x-signature'];
    const message = request.headers['x-message'];

    if (!walletAddress || !signature || !message) {
      throw new UnauthorizedException('Missing authentication headers');
    }

    try {
      const publicKey = new PublicKey(walletAddress);
      const messageBytes = new TextEncoder().encode(
        `Access to forge.ai: ${message}`,
      );
      const signatureBytes = Buffer.from(signature, 'base64');

      const isValid = nacl.sign.detached.verify(
        messageBytes,
        signatureBytes,
        publicKey.toBytes(),
      );

      if (!isValid) {
        throw new UnauthorizedException('Invalid signature');
      }

      request.walletAddress = walletAddress;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid signature');
    }
  }
}
