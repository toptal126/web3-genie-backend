import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Conversation } from '../../database/schemas/conversation.schema';
import { Message } from '../../database/schemas/message.schema';

@Injectable()
export class ConversationModel {
  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<Conversation>,
    @InjectModel(Message.name) private messageModel: Model<Message>,
  ) {}

  async create(userId: string, title: string): Promise<Conversation> {
    const conversation = new this.conversationModel({
      user_id: userId,
      title,
    });
    return conversation.save();
  }

  async update(id: string, title: string): Promise<Conversation | null> {
    return this.conversationModel.findByIdAndUpdate(
      id,
      { title },
      { new: true },
    );
  }

  async findByUserId(userId: string): Promise<Conversation[]> {
    return this.conversationModel
      .find({ user_id: userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<Conversation | null> {
    return this.conversationModel.findById(id).exec();
  }

  async delete(id: string): Promise<boolean> {
    const session = await this.conversationModel.startSession();
    try {
      await session.withTransaction(async () => {
        await this.messageModel
          .deleteMany({ conversation_id: id })
          .session(session);
        await this.conversationModel.findByIdAndDelete(id).session(session);
      });
      return true;
    } catch (error) {
      return false;
    } finally {
      session.endSession();
    }
  }
}
