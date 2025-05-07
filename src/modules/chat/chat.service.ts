import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OpenAIService } from './openai.service';
import { IConversation } from '../database/schemas/conversation.schema';
import { IMessage } from '../database/schemas/message.schema';
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
import { ConversationResponseDto } from './dto/conversation.dto';

interface TokenAnalysisDto {
  address: string;
  network?: AlchemyNetwork;
  conversationId?: string;
}

@Injectable()
export class ChatService {
  constructor(
    @InjectModel('Conversation')
    private conversationModel: Model<IConversation>,
    @InjectModel('Message') private messageModel: Model<IMessage>,
    private openaiService: OpenAIService,
    private readonly moralisApiService: MoralisApiService,
    private readonly heliusApiService: HeliusApiService,
    private readonly solanaFMApiService: SolanaFMApiService,
    private readonly pumpFunApiService: PumpFunApiService,
    private readonly solscanApiService: SolscanApiService,
    private readonly userService: UserService,
  ) {}

  async createOrUpdateEmptyConveration(
    walletAddress: string,
    title: string,
  ): Promise<ConversationResponseDto> {
    const conversation =
      await this.getOrCreateLatestConversation(walletAddress);
    const user = await this.userService.getUserByWalletAddress(walletAddress);
    if (conversation.messages.length === 0) {
      // update the title of the conversation
      const conversationId = (conversation.conversation as any)._id.toString();
      await this.conversationModel.findByIdAndUpdate(
        conversationId,
        { title },
        { new: true },
      );
      const updatedConversation =
        await this.conversationModel.findById(conversationId);
      if (!updatedConversation) {
        throw new NotFoundException('Conversation not found after update');
      }
      const leanConversation = updatedConversation.toObject();
      return {
        _id: leanConversation._id,
        title: leanConversation.title,
        user_id: leanConversation.user_id,
        createdAt: leanConversation.createdAt,
        updatedAt: leanConversation.updatedAt,
      };
    } else {
      // create a new conversation
      const newConversation = await this.conversationModel.create({
        user_id: user.id,
        title,
      });
      const leanConversation = newConversation.toObject();
      return {
        _id: leanConversation._id,
        title: leanConversation.title,
        user_id: leanConversation.user_id,
        createdAt: leanConversation.createdAt,
        updatedAt: leanConversation.updatedAt,
      };
    }
  }

  async getConversations(walletAddress: string): Promise<IConversation[]> {
    const user = await this.userService.getUserByWalletAddress(walletAddress);
    return this.conversationModel
      .find({ user_id: user.id })
      .sort({ createdAt: -1 })
      .lean();
  }

  async getConversation(
    conversationId: string,
    walletAddress: string,
  ): Promise<{ conversation: IConversation; messages: IMessage[] }> {
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

    const messages = await this.messageModel
      .find({ conversation_id: conversationId })
      .sort({ createdAt: 1 })
      .exec();

    return { conversation: conversation.toObject(), messages };
  }

  async getOrCreateLatestConversation(
    walletAddress: string,
  ): Promise<{ conversation: IConversation; messages: IMessage[] }> {
    const user = await this.userService.getUserByWalletAddress(walletAddress);
    const conversations = await this.conversationModel
      .find({ user_id: user.id })
      .sort({ createdAt: -1 })
      .lean();

    if (conversations.length > 0) {
      const latestConversation = conversations[0];
      if (latestConversation.user_id.toString() !== user.id) {
        throw new UnauthorizedException(
          'You do not have access to this conversation',
        );
      }

      const messages = await this.messageModel
        .find({ conversation_id: latestConversation._id })
        .sort({ createdAt: 1 })
        .exec();
      return { conversation: latestConversation, messages };
    } else {
      // Create a new conversation if none exists
      const newConversation = await this.conversationModel.create({
        user_id: user.id,
        title: 'New Conversation',
      });
      return {
        conversation: newConversation.toObject(),
        messages: [],
      };
    }
  }

  async sendMessage(
    conversationId: string,
    content: string,
    walletAddress: string,
  ): Promise<IMessage> {
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
    await this.messageModel.create({
      conversation_id: conversationId,
      role: 'user',
      content,
    });

    // Get conversation history
    const messages = await this.messageModel
      .find({ conversation_id: conversationId })
      .sort({ createdAt: 1 })
      .exec();

    // Generate AI response
    const aiResponse =
      await this.openaiService.generateGeneralChatCompletion(messages);

    // Store AI response
    const aiMessage = await this.messageModel.create({
      conversation_id: conversationId,
      role: 'assistant',
      content: aiResponse.content || 'No response generated',
    });

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

    const session = await this.conversationModel.startSession();
    try {
      await session.withTransaction(async () => {
        await this.messageModel
          .deleteMany({ conversation_id: conversationId })
          .session(session);
        await this.conversationModel
          .findByIdAndDelete(conversationId)
          .session(session);
      });
      return {
        success: true,
        message:
          'Conversation and all associated messages deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete conversation',
      };
    } finally {
      session.endSession();
    }
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
      let chatHistory: IMessage[] = [];
      if (conversationId) {
        chatHistory = await this.messageModel
          .find({ conversation_id: conversationId })
          .sort({ createdAt: 1 })
          .exec();
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
      this.messageModel.create({
        conversation_id: conversationId,
        role: 'user',
        content: `Analyze the token ${address} on the ${network} network`,
      });
      const responseMessage = await this.messageModel.create({
        conversation_id: newConversationId,
        role: 'assistant',
        content: response.content ?? 'No response generated',
      });

      return responseMessage;
    } catch (error) {
      throw new Error(`Failed to analyze token: ${error.message}`);
    }
  }
}
