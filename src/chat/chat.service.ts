import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { OpenAIService } from './openai.service';

@Injectable()
export class ChatService {
  constructor(
    private databaseService: DatabaseService,
    private openaiService: OpenAIService,
  ) {}

  async createConversation(userId: number, title: string) {
    const result = this.databaseService.run(
      'INSERT INTO conversations (user_id, title) VALUES (?, ?)',
      [userId, title]
    );
    return { id: result.lastInsertRowid };
  }

  async getConversations(userId: number) {
    return this.databaseService.query(
      'SELECT * FROM conversations WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
  }

  async getConversation(conversationId: number) {
    const conversation = this.databaseService.queryOne(
      'SELECT * FROM conversations WHERE id = ?',
      [conversationId]
    );

    if (!conversation) return null;

    const messages = this.databaseService.query(
      'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
      [conversationId]
    );

    return { ...conversation, messages };
  }

  async sendMessage(conversationId: number, content: string) {
    // Store user message
    this.databaseService.run(
      'INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)',
      [conversationId, 'user', content]
    );

    // Get conversation history
    const messages = this.databaseService.query(
      'SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
      [conversationId]
    );

    // Generate AI response
    const aiResponse = await this.openaiService.generateChatCompletion(messages);

    // Store AI response
    this.databaseService.run(
      'INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)',
      [conversationId, 'assistant', aiResponse.content]
    );

    return aiResponse;
  }

  async deleteConversation(conversationId: number) {
    // First delete all messages associated with the conversation
    this.databaseService.run(
      'DELETE FROM messages WHERE conversation_id = ?',
      [conversationId]
    );

    // Then delete the conversation itself
    const result = this.databaseService.run(
      'DELETE FROM conversations WHERE id = ?',
      [conversationId]
    );

    return { 
      success: result.changes > 0,
      message: result.changes > 0 
        ? 'Conversation and all associated messages deleted successfully' 
        : 'Conversation not found'
    };
  }
}