import { Injectable, NotFoundException } from '@nestjs/common';
import { OpenAIService } from './openai.service';
import { ConversationModel } from './models/conversation.model';
import { MessageModel } from './models/message.model';
import { Conversation } from '../database/schemas/conversation.schema';
import { Message } from '../database/schemas/message.schema';

@Injectable()
export class ChatService {
  constructor(
    private conversationModel: ConversationModel,
    private messageModel: MessageModel,
    private openaiService: OpenAIService,
  ) {}

  async createConversation(userId: string, title: string): Promise<Conversation> {
    return this.conversationModel.create(userId, title);
  }

  async getConversations(userId: string): Promise<Conversation[]> {
    return this.conversationModel.findByUserId(userId);
  }

  async getConversation(conversationId: string): Promise<{ conversation: Conversation; messages: Message[] }> {
    const conversation = await this.conversationModel.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${conversationId} not found`);
    }

    const messages = await this.messageModel.findByConversationId(conversationId);
    return { conversation, messages };
  }

  async sendMessage(conversationId: string, content: string): Promise<Message> {
    // Check if conversation exists
    const conversation = await this.conversationModel.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${conversationId} not found`);
    }

    // Store user message
    await this.messageModel.create(conversationId, 'user', content);

    // Get conversation history
    const messages = await this.messageModel.findByConversationId(conversationId);

    // Generate AI response
    const aiResponse = await this.openaiService.generateChatCompletion(messages);

    // Store AI response
    const aiMessage = await this.messageModel.create(
      conversationId,
      'assistant',
      aiResponse.content || 'No response generated',
    );

    return aiMessage;
  }

  async deleteConversation(conversationId: string): Promise<{ success: boolean; message: string }> {
    const deleted = await this.conversationModel.delete(conversationId);
    return {
      success: deleted,
      message: deleted
        ? 'Conversation and all associated messages deleted successfully'
        : 'Conversation not found',
    };
  }
}