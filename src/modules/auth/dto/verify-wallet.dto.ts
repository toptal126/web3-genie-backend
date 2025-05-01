import { IsString, IsNotEmpty, Length } from 'class-validator';

export class VerifyWalletDto {
  @IsString()
  @IsNotEmpty()
  @Length(32, 44) // Solana addresses are 32-44 characters
  walletAddress: string;

  @IsString()
  @IsNotEmpty()
  signedNonce: string;

  @IsString()
  @IsNotEmpty()
  nonce: string;
}
