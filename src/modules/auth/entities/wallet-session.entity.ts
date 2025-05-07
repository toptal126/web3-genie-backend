import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class WalletSession extends Document {
  @Prop({ required: true, unique: true, index: true })
  nonce: string;

  @Prop({ required: true, unique: true, index: true })
  wallet_address: string;

  @Prop({ required: true })
  expires_at: Date;

  @Prop()
  session_token: string;

  @Prop({ default: false })
  is_used: boolean;
}

export const WalletSessionSchema = SchemaFactory.createForClass(WalletSession);
