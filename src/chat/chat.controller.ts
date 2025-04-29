import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('conversations')
  async createConversation(@Body() body: { userId: number; title: string }) {
    return this.chatService.createConversation(body.userId, body.title);
  }

  @Get('conversations/:userId')
  async getConversations(@Param('userId') userId: number) {
    return this.chatService.getConversations(userId);
  }

  @Get('conversation/:id')
  async getConversation(@Param('id') id: number) {
    return this.chatService.getConversation(id);
  }

  @Post('message')
  async sendMessage(@Body() body: { conversationId: number; content: string }) {
    return this.chatService.sendMessage(body.conversationId, body.content);
  }
}