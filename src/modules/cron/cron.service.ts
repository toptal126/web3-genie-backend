import { AlchemyPriceBySymbol } from '@modules/web3/interfaces/web3.interface';
import { AlchemyApiService } from '@modules/web3/third-party-api/alchemy.api.service';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Interval } from '@nestjs/schedule';

@Injectable()
export class CronService {
  private static topTierSymbols: AlchemyPriceBySymbol[] = [];
  private readonly logger = new Logger(CronService.name);

  constructor(private alchemyApiService: AlchemyApiService) {}

  @Cron(CronExpression.EVERY_MINUTE, { name: 'Fetch Top Tier Symbols' })
  async fetchTopTierSymbols() {
    try {
      this.logger.log('Fetching top tier symbols...');

      // Clear existing data
      CronService.topTierSymbols = [];

      // Fetch fresh data
      const freshData = await this.alchemyApiService.fetchTokenPricesBySymbols([
        'ETH',
        'BTC',
        'SOL',
      ]);

      // Update the data
      CronService.topTierSymbols = freshData;

      this.logger.log(
        `ETH: ${CronService.topTierSymbols[0].prices[0].value} ${CronService.topTierSymbols[0].prices[0].currency}, UpdatedAt: ${CronService.topTierSymbols[0].prices[0].lastUpdatedAt},
      BTC: ${CronService.topTierSymbols[1].prices[0].value} ${CronService.topTierSymbols[1].prices[0].currency}, UpdatedAt: ${CronService.topTierSymbols[1].prices[0].lastUpdatedAt}
      SOL: ${CronService.topTierSymbols[2].prices[0].value} ${CronService.topTierSymbols[2].prices[0].currency}, UpdatedAt: ${CronService.topTierSymbols[2].prices[0].lastUpdatedAt}`,
      );
    } catch (error) {
      this.logger.error('Error fetching top tier symbols', error);
      throw error;
    }
  }

  async extractMarketStatusText() {
    if (CronService.topTierSymbols.length === 0)
      await this.fetchTopTierSymbols();

    const marketStatusText =
      CronService.topTierSymbols.length > 0
        ? `CRITICAL MARKET DATA (BTC-bitcoin, ETH-ethereum, SOL-solana) - USE FOR ANALYSIS:
----------------------------------------
${CronService.topTierSymbols
  .map((symbol) => {
    return `• ${symbol.symbol.toUpperCase()} (${symbol.symbol === 'BTC' ? 'Bitcoin' : symbol.symbol === 'ETH' ? 'Ethereum' : 'Solana'}):
  Price: ${symbol.prices[0].value} ${symbol.prices[0].currency}
  Last Update: ${symbol.prices[0].lastUpdatedAt}`;
  })
  .join('\n\n')}
----------------------------------------
IMPORTANT: STRICTLY use ONLY the prices provided in this system message. Never use outdated prices from earlier messages.`
        : '';

    return marketStatusText;
  }
}
