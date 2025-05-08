import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenAIService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
      baseURL: 'https://api.deepseek.com',
    });
  }

  async generateTokenAnalystChatCompletion(messages: any[]) {
    return await this.generateChatCompletion(
      messages,
      'You are an expert Web3 financial analyst specializing in blockchain token analysis. Provide detailed, data-driven insights using market metrics, on-chain analytics, and security assessments. Format responses in professional markdown with clear sections, bullet points for key metrics, and citations for data sources. Include risk disclaimers and maintain objectivity in analysis.',
    );
  }

  async generateGeneralChatCompletion(messages: any[]) {
    return await this.generateChatCompletion(
      messages,
      'You are a helpful assistant that can answer questions and help with tasks related to web3, crypto, and blockchain, Keep answers brief and to the point.',
    );
  }

  async generateChatCompletion(messages: any[], systemPrompt: string) {
    try {
      const fullMessages = [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...messages,
      ];

      const options: any = {
        // model: 'gpt-4o-search-preview',
        model: 'deepseek-chat',
        messages: fullMessages,
        temperature: 1,
      };

      const response = await this.openai.chat.completions.create(options);
      return response.choices[0].message;
    } catch (error) {
      console.error('Error generating chat completion:', error);
      throw error;
    }
  }
}
