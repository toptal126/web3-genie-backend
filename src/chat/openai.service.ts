import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class OpenAIService {
  private openai: OpenAI;

  constructor(
    private configService: ConfigService,
    private databaseService: DatabaseService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async generateChatCompletion(messages: any[], functions?: any[]) {
    try {
      const systemPrompt = this.databaseService.queryOne(
        'SELECT value FROM system_configs WHERE key = ?',
        ['system_prompt'],
      );

      const fullMessages = [
        {
          role: 'system',
          content:
            (systemPrompt as { value: string })?.value ||
            'You are a helpful AI assistant with Web3 knowledge.',
        },
        ...messages,
      ];

      const options: any = {
        model: 'gpt-4',
        messages: fullMessages,
        temperature: 0.7,
      };

      if (functions && functions.length > 0) {
        options.functions = functions;
        options.function_call = 'auto';
      }

      const response = await this.openai.chat.completions.create(options);
      return response.choices[0].message;
    } catch (error) {
      console.error('Error generating chat completion:', error);
      throw error;
    }
  }
}
