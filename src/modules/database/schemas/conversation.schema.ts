import { Schema } from 'mongoose';
import mongoose from 'mongoose';

export interface IConversation {
  _id: string;
  user_id: string;
  title: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const ConversationSchema = new Schema<IConversation>(
  {
    user_id: {
      type: String,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export const ConversationModel = mongoose.model<IConversation>(
  'Conversation',
  ConversationSchema,
);
