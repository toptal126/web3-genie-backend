import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { SystemConfigModel } from '../database/models/system-config.model';

@Injectable()
export class OpenAIService {
  private openai: OpenAI;

  constructor(
    private configService: ConfigService,
    private systemConfigModel: SystemConfigModel,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
      baseURL: 'https://api.deepseek.com',
    });
  }

  async generateChatCompletion(messages: any[], functions?: any[]) {
    try {
      const systemPrompt = await this.systemConfigModel.get('system_prompt');

      const fullMessages = [
        {
          role: 'system',
          content:
            systemPrompt ||
            'You are a helpful AI assistant with Web3 knowledge. Result should be in styled markdown, and should include external sources. You must Use web search for latest updates.',
        },
        ...messages,
      ];

      const options: any = {
        // model: 'gpt-4o-search-preview',
        model: 'deepseek-reasoner',
        messages: fullMessages,
        temperature: 1,
      };

      if (functions && functions.length > 0) {
        options.functions = functions;
        options.function_call = 'auto';
      }
      console.log(options);

      const response = await this.openai.chat.completions.create(options);
      return response.choices[0].message;
    } catch (error) {
      console.error('Error generating chat completion:', error);
      throw error;
    }
  }
}
