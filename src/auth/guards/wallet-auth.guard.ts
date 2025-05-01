import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import * as nacl from 'tweetnacl';
import { PublicKey } from '@solana/web3.js';

@Injectable()
export class WalletAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const walletAddress = request.headers['x-wallet-address'];
    const signature = request.headers['x-signature'];
    const message = request.headers['x-message'];

    if (!walletAddress || !signature || !message) {
      throw new UnauthorizedException('Missing required headers');
    }

    try {
      const publicKey = new PublicKey(walletAddress);
      const signatureBytes = Buffer.from(signature, 'base64');
      const messageBytes = new TextEncoder().encode(message);

      const isValid = nacl.sign.detached.verify(
        messageBytes,
        signatureBytes,
        publicKey.toBytes(),
      );

      if (!isValid) {
        throw new UnauthorizedException('Invalid signature');
      }

      // Attach wallet address to request for use in controllers
      request.walletAddress = walletAddress;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid wallet address or signature');
    }
  }
}
