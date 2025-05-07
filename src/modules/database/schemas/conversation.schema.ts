import { Schema } from 'mongoose';
import mongoose from 'mongoose';

interface TokenAnalysisData {
  address: string;
  data: any;
  timestamp: Date;
}

export interface IConversation {
  _id: string;
  user_id: string;
  title: string;
  tokenAnalysisData?: TokenAnalysisData[];
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
    tokenAnalysisData: [
      {
        address: String,
        data: Schema.Types.Mixed,
        timestamp: Date,
      },
    ],
  },
  { timestamps: true },
);

export const ConversationModel = mongoose.model<IConversation>(
  'Conversation',
  ConversationSchema,
);
