import { Schema } from 'mongoose';
import mongoose from 'mongoose';

export interface IMessage {
  _id: string;
  conversationId: mongoose.Types.ObjectId;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export const MessageModel = mongoose.model<IMessage>('Message', messageSchema);
