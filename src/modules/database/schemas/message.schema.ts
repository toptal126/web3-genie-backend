import { Schema } from 'mongoose';
import mongoose from 'mongoose';

export interface IMessage {
  _id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const messageSchema = new Schema<IMessage>(
  {
    conversation_id: {
      type: String,
      required: true,
      ref: 'Conversation',
    },
    role: {
      type: String,
      required: true,
      enum: ['user', 'assistant', 'system'],
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export const MessageModel = mongoose.model<IMessage>('Message', messageSchema);
