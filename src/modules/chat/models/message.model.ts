import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from '../../database/schemas/message.schema';

@Injectable()
export class MessageModel {
  constructor(@InjectModel(Message.name) private messageModel: Model<Message>) {}

  async create(conversationId: string, role: string, content: string): Promise<Message> {
    const message = new this.messageModel({
      conversation_id: conversationId,
      role,
      content,
    });
    return message.save();
  }

  async findByConversationId(conversationId: string): Promise<Message[]> {
    return this.messageModel
      .find({ conversation_id: conversationId })
      .sort({ createdAt: 1 })
      .exec();
  }

  async deleteByConversationId(conversationId: string): Promise<void> {
    await this.messageModel.deleteMany({ conversation_id: conversationId }).exec();
  }
} 