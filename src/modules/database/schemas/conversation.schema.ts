import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';

@Schema({ timestamps: true })
export class Conversation extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: User;

  @Prop({ required: true })
  title: string;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation); 