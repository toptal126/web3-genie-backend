import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { OpenAIService } from './openai.service';
import { ConversationModel } from './models/conversation.model';
import { MessageModel } from './models/message.model';
import { Conversation } from '../database/schemas/conversation.schema';
import { Message } from '../database/schemas/message.schema';
import { Web3Service } from '../web3/web3.service';
import { MoralisApiService } from '../web3/third-party-api/moralis.api.service';
import { HeliusApiService } from '../web3/third-party-api/helius.api.service';
import { SolanaFMApiService } from '../web3/third-party-api/solanafm.api.service';
import { Network as AlchemyNetwork } from 'alchemy-sdk';
import { generateTokenAnalysisPrompt } from './templates/solana-spl-analytics.template';
import { transformTokenData } from './transformers/token-analysis.transformer';
import { TokenAnalysisRawData } from './types/token-analysis.types';
import { PumpFunApiService } from '../web3/third-party-api/pumpfun.api.service';
import { SolscanApiService } from '@modules/web3/third-party-api/solscan.api.service';
import { Types } from 'mongoose';
import * as solanaArticles from './templates/articles/solana-articles.json';
import { UserService } from '../user/user.service';

interface TokenAnalysisDto {
  address: string;
  network?: AlchemyNetwork;
  conversationId?: string;
}

@Injectable()
export class ChatService {
  constructor(
    private conversationModel: ConversationModel,
    private messageModel: MessageModel,
    private openaiService: OpenAIService,
    private readonly moralisApiService: MoralisApiService,
    private readonly heliusApiService: HeliusApiService,
    private readonly solanaFMApiService: SolanaFMApiService,
    private readonly pumpFunApiService: PumpFunApiService,
    private readonly solscanApiService: SolscanApiService,
    private readonly userService: UserService,
  ) {}

  async createConversation(
    walletAddress: string,
    title: string,
  ): Promise<Conversation> {
    const user = await this.userService.getUserByWalletAddress(walletAddress);

    const latestConversation =
      await this.getOrCreateLatestConversation(walletAddress);
    if (latestConversation.messages.length === 0) {
      await this.conversationModel.update(
        latestConversation.conversation.id,
        title,
      );
      latestConversation.conversation.title = title;
      return latestConversation.conversation;
    }

    return this.conversationModel.create(user.id, title);
  }

  async getConversations(walletAddress: string): Promise<Conversation[]> {
    const user = await this.userService.getUserByWalletAddress(walletAddress);
    return this.conversationModel.findByUserId(user.id);
  }

  async getConversation(
    conversationId: string,
    walletAddress: string,
  ): Promise<{ conversation: Conversation; messages: Message[] }> {
    const conversation = await this.conversationModel.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException(
        `Conversation with ID ${conversationId} not found`,
      );
    }

    const user = await this.userService.getUserByWalletAddress(walletAddress);
    if (conversation.user_id.toString() !== user.id) {
      throw new UnauthorizedException(
        'You do not have access to this conversation',
      );
    }

    const messages =
      await this.messageModel.findByConversationId(conversationId);
    return { conversation, messages };
  }

  async getOrCreateLatestConversation(
    walletAddress: string,
  ): Promise<{ conversation: Conversation; messages: Message[] }> {
    const user = await this.userService.getUserByWalletAddress(walletAddress);
    const conversations = await this.conversationModel.findByUserId(user.id);
    if (!conversations.length) {
      return {
        conversation: await this.createConversation(
          walletAddress,
          'New Conversation',
        ),
        messages: [],
      };
    }

    if (conversations[0].user_id.toString() !== user.id) {
      throw new UnauthorizedException(
        'You do not have access to this conversation',
      );
    }

    const messages = await this.messageModel.findByConversationId(
      conversations[0].id,
    );
    return { conversation: conversations[0], messages };
  }

  async sendMessage(
    conversationId: string,
    content: string,
    walletAddress: string,
  ): Promise<Message> {
    const conversation = await this.conversationModel.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException(
        `Conversation with ID ${conversationId} not found`,
      );
    }

    const user = await this.userService.getUserByWalletAddress(walletAddress);
    if (conversation.user_id.toString() !== user.id) {
      throw new UnauthorizedException(
        'You do not have access to this conversation',
      );
    }

    // Store user message
    await this.messageModel.create(conversationId, 'user', content);

    // Get conversation history
    const messages =
      await this.messageModel.findByConversationId(conversationId);

    // Generate AI response
    const aiResponse =
      await this.openaiService.generateGeneralChatCompletion(messages);

    // Store AI response
    const aiMessage = await this.messageModel.create(
      conversationId,
      'assistant',
      aiResponse.content || 'No response generated',
    );

    return aiMessage;
  }

  async deleteConversation(
    conversationId: string,
    walletAddress: string,
  ): Promise<{ success: boolean; message: string }> {
    const conversation = await this.conversationModel.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException(
        `Conversation with ID ${conversationId} not found`,
      );
    }

    const user = await this.userService.getUserByWalletAddress(walletAddress);
    if (conversation.user_id.toString() !== user.id) {
      throw new UnauthorizedException(
        'You do not have access to this conversation',
      );
    }

    const deleted = await this.conversationModel.delete(conversationId);
    return {
      success: deleted,
      message: deleted
        ? 'Conversation and all associated messages deleted successfully'
        : 'Conversation not found',
    };
  }

  /**
   * Analyzes token market data and provides insights
   * @param tokenAnalysisDto - Token address, network, and optional conversation ID
   * @returns Analysis results and insights
   * @throws Error if the token is not on Solana network
   */
  async requestTokenAnalysis(
    tokenAnalysisDto: TokenAnalysisDto,
    walletAddress: string,
  ) {
    const { address, network, conversationId } = tokenAnalysisDto;

    if (!conversationId) {
      throw new BadRequestException('Conversation ID is required');
    }

    if (!walletAddress) {
      throw new BadRequestException('Wallet address is required');
    }

    // Check if network is supported
    if (network !== AlchemyNetwork.SOLANA_MAINNET) {
      throw new Error('Only Solana mainnet is supported for token analysis');
    }

    try {
      // Fetch token data from various sources
      const [
        solanaFmTokenInfo,
        solscanTokenInfo,
        tokenHolders,
        tokenAnalytics,
        bondingStatus,
        tokenPairStats,
      ] = await Promise.all([
        this.solanaFMApiService.getTokenInfo(address),
        this.solscanApiService.getTokenInfo(address),
        this.moralisApiService.getTokenHolders(address),
        this.moralisApiService.getTokenAnalytics(address),
        this.pumpFunApiService
          .getTokenBondingStatus(address)
          .catch(() => undefined),
        this.moralisApiService.getTokenPairStats(address),
      ]);

      // Transform raw API data into the format expected by the prompt
      const rawData: TokenAnalysisRawData = {
        solanaFmTokenInfo: solanaFmTokenInfo,
        solscanTokenInfo: solscanTokenInfo,
        tokenHolders,
        tokenAnalytics,
        bondingStatus,
        tokenPairStats,
      };

      if (!solanaFmTokenInfo && !solscanTokenInfo) {
        return {
          success: false,
          message: 'Token info is required for analysis',
        };
      }

      const tokenData = transformTokenData(rawData);

      // Get chat history if conversationId is provided
      let chatHistory: Message[] = [];
      if (conversationId) {
        chatHistory = await this.messageModel.findByConversationId(
          conversationId!,
        );
      }

      // Generate system prompt for token analysis with news articles
      const systemPrompt = generateTokenAnalysisPrompt(
        tokenData,
        solanaArticles.articles,
      );

      // Generate AI response
      const messages = [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...chatHistory.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      ];

      const response =
        await this.openaiService.generateTokenAnalystChatCompletion(messages);

      // Create and save the response message
      const newConversationId =
        conversationId ?? new Types.ObjectId().toString();

      // add new message in user style requesting token analysis
      this.messageModel.create(
        conversationId,
        'user',
        `Analyze the token ${address} on the ${network} network`,
      );
      const responseMessage = await this.messageModel.create(
        newConversationId,
        'assistant',
        response.content ?? 'No response generated',
      );

      return responseMessage;
    } catch (error) {
      throw new Error(`Failed to analyze token: ${error.message}`);
    }
  }
}
