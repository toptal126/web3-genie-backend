import { AlchemyPriceBySymbol } from '@modules/web3/interfaces/web3.interface';
import { AlchemyApiService } from '@modules/web3/third-party-api/alchemy.api.service';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Interval } from '@nestjs/schedule';

@Injectable()
export class CronService {
  private topTierSymbols: AlchemyPriceBySymbol[] = [];

  constructor(private alchemyApiService: AlchemyApiService) {}

  @Cron(CronExpression.EVERY_MINUTE, { name: 'Fetch Top Tier Symbols' })
  async fetchTopTierSymbols() {
    this.topTierSymbols =
      await this.alchemyApiService.fetchTokenPricesBySymbols([
        'ETH',
        'BTC',
        'SOL',
      ]);
  }

  async extractMarketStatusText() {
    const currentTime = new Date();
    if (this.topTierSymbols.length === 0) await this.fetchTopTierSymbols();

    const marketStatusText =
      this.topTierSymbols.length > 0
        ? 'Here is current BTC, SOL, ETH prices today, you must use this data to analyze the market:  \n' +
          this.topTierSymbols.map((symbol) => {
            const timeDiff =
              (currentTime.getTime() -
                new Date(symbol.prices[0].lastUpdatedAt).getTime()) /
              1000;
            return `${symbol.symbol}: ${symbol.prices[0].value} ${symbol.prices[0].currency}, updated at ${Math.floor(timeDiff / 1000)} seconds ago`;
          })
        : '';

    return marketStatusText;
  }
}
