import { AlchemyPriceBySymbol } from '@modules/web3/interfaces/web3.interface';
import { AlchemyApiService } from '@modules/web3/third-party-api/alchemy.api.service';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Interval } from '@nestjs/schedule';

@Injectable()
export class CronService {
  private topTierSymbols: AlchemyPriceBySymbol[] = [];
  private readonly logger = new Logger(CronService.name);

  constructor(private alchemyApiService: AlchemyApiService) {}

  @Cron(CronExpression.EVERY_MINUTE, { name: 'Fetch Top Tier Symbols' })
  async fetchTopTierSymbols() {
    this.topTierSymbols =
      await this.alchemyApiService.fetchTokenPricesBySymbols([
        'ETH',
        'BTC',
        'SOL',
      ]);

    this.logger.log(
      `ETH: ${this.topTierSymbols[0].prices[0].value} ${this.topTierSymbols[0].prices[0].currency}, UpdatedAt: ${this.topTierSymbols[0].prices[0].lastUpdatedAt},
      BTC: ${this.topTierSymbols[1].prices[0].value} ${this.topTierSymbols[1].prices[0].currency}, UpdatedAt: ${this.topTierSymbols[1].prices[0].lastUpdatedAt}
      SOL: ${this.topTierSymbols[2].prices[0].value} ${this.topTierSymbols[2].prices[0].currency}, UpdatedAt: ${this.topTierSymbols[2].prices[0].lastUpdatedAt}`,
    );
  }

  async extractMarketStatusText() {
    if (this.topTierSymbols.length === 0) await this.fetchTopTierSymbols();

    const marketStatusText =
      this.topTierSymbols.length > 0
        ? `CRITICAL MARKET DATA (BTC-bitcoin, ETH-ethereum, SOL-solana) - USE FOR ANALYSIS:
----------------------------------------
${this.topTierSymbols
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
