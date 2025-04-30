import { Controller, Post, Body, Get, Param, UseGuards, Delete } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('conversations')
  @ApiOperation({ summary: 'Create a new conversation' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'The ID of the user creating the conversation',
        },
        title: {
          type: 'string',
          description: 'The title of the conversation',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Conversation created successfully' })
  async createConversation(@Body() body: { userId: string; title: string }) {
    return this.chatService.createConversation(body.userId, body.title);
  }

  @Get('conversations/:userId')
  @ApiOperation({ summary: 'Get all conversations for a user' })
  @ApiParam({
    name: 'userId',
    type: 'string',
    description: 'The ID of the user',
  })
  @ApiResponse({ status: 200, description: 'Returns list of conversations' })
  async getConversations(@Param('userId') userId: string) {
    return this.chatService.getConversations(userId);
  }

  @Get('conversation/:id')
  @ApiOperation({ summary: 'Get a specific conversation by ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'The ID of the conversation',
  })
  @ApiResponse({ status: 200, description: 'Returns the conversation details' })
  async getConversation(@Param('id') id: string) {
    return this.chatService.getConversation(id);
  }

  @Post('message')
  @ApiOperation({ summary: 'Send a message in a conversation' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        conversationId: {
          type: 'string',
          description: 'The ID of the conversation',
        },
        content: {
          type: 'string',
          description: 'The message content',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  async sendMessage(@Body() body: { conversationId: string; content: string }) {
    return this.chatService.sendMessage(body.conversationId, body.content);
  }

  @Delete('conversation/:id')
  @ApiOperation({ summary: 'Delete a conversation' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'The ID of the conversation to delete',
  })
  @ApiResponse({ status: 200, description: 'Conversation deleted successfully' })
  async deleteConversation(@Param('id') id: string) {
    return this.chatService.deleteConversation(id);
  }
}