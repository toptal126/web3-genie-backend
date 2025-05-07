export interface TokenAnalysisPrompt {
  // System instruction for the AI
  systemInstruction: string;

  // Token data structure
  tokenData: {
    address: string;
    metadata: {
      name: string;
      symbol: string;
      decimals: number;
      totalSupply: string;
      creator?: string;
      description?: string;
      logo?: string;
      tags?: string[];
      verified?: boolean;
      social?: {
        twitter?: string;
        website?: string;
      };
    };
    marketData: {
      price: number;
      priceChange24h: number;
      highPrice24h: number;
      lowPrice24h: number;
      volume24h: number;
      buyVolume24h: number;
      sellVolume24h: number;
      totalBuys24h: number;
      totalSells24h: number;
      totalBuyers24h: number;
      totalSellers24h: number;
      liquidityUSD: number;
      fullyDilutedValuation: number;
      marketCapRank?: number;
      bondingProgress?: number;
      dexInfo: {
        activePairs: number;
        activeDexes: number;
      };
      volumeSources?: {
        solscan: number;
        moralis: number;
        pairStats: number;
      };
    };
    onChainMetrics: {
      holders: {
        total: number;
        top10Percentage: number;
        top50Percentage: number;
        distribution: {
          whales: number;
          sharks: number;
          dolphins: number;
          fish: number;
          octopus: number;
          crabs: number;
          shrimps: number;
        };
        acquisition: {
          swap: number;
          transfer: number;
          airdrop: number;
        };
        change: {
          '5min': { change: number; changePercent: number };
          '1h': { change: number; changePercent: number };
          '6h': { change: number; changePercent: number };
          '24h': { change: number; changePercent: number };
        };
      };
      activity: {
        transactions24h: number;
        largeTransactions24h: number;
        newHolders24h: number;
        priceCandles: Array<{
          timestamp: number;
          open: number;
          high: number;
          low: number;
          close: number;
          volume: number;
        }>;
      };
    };
    security: {
      verifiedCreator: boolean;
      contractVerified: boolean;
      warnings?: string[];
    };
  };

  // News articles for context
  newsArticles?: Array<{
    title: string;
    content: string;
    link: string;
    updatedAt: string;
  }>;

  // Response format instructions
  responseFormat: {
    sections: string[];
    style: 'concise' | 'balanced' | 'detailed';
  };
}

// Helper to format large numbers
const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
  return num.toFixed(2);
};

// Helper function to format token data
const formatTokenData = (token: TokenAnalysisPrompt['tokenData']): string => {
  const volumeComparison = token.marketData.volumeSources
    ? `
    **Volume Comparison (24h)**:
    - Solscan: $${formatNumber(token.marketData.volumeSources.solscan)}
    - Moralis: $${formatNumber(token.marketData.volumeSources.moralis)}
    - Pair Stats: $${formatNumber(token.marketData.volumeSources.pairStats)}
  `
    : '';

  const bondingInfo =
    token.marketData.bondingProgress !== undefined
      ? `
    **Bonding Status**:
    - Progress: ${token.marketData.bondingProgress.toFixed(2)}%
    - Deployed via pump.fun: ${token.marketData.bondingProgress > 0 ? 'Yes' : 'No'}
  `
      : '';

  return `
    **Basic Info**:
    - ${token.metadata.name} (${token.metadata.symbol})
    - Address: ${token.address}
    - Decimals: ${token.metadata.decimals}
    - Total Supply: ${token.metadata.totalSupply}
    ${token.metadata.creator ? `- Creator: ${token.metadata.creator}` : ''}
    ${token.metadata.description ? `- Description: ${token.metadata.description}` : ''}
    ${token.metadata.tags?.length ? `- Tags: ${token.metadata.tags.join(', ')}` : ''}
    ${token.metadata.social?.twitter ? `- Twitter: ${token.metadata.social.twitter}` : ''}
    ${token.metadata.social?.website ? `- Website: ${token.metadata.social.website}` : ''}
  
    **Market Data**:
    - Price: $${token.marketData.price.toFixed(6)}
    - 24h Change: ${token.marketData.priceChange24h > 0 ? '+' : ''}${token.marketData.priceChange24h}%
    - 24h High: $${token.marketData.highPrice24h.toFixed(6)}
    - 24h Low: $${token.marketData.lowPrice24h.toFixed(6)}
    - Volume (24h): $${formatNumber(token.marketData.volume24h)}
    - Buy Volume (24h): $${formatNumber(token.marketData.buyVolume24h)}
    - Sell Volume (24h): $${formatNumber(token.marketData.sellVolume24h)}
    - Total Buys (24h): ${formatNumber(token.marketData.totalBuys24h)}
    - Total Sells (24h): ${formatNumber(token.marketData.totalSells24h)}
    - Unique Buyers (24h): ${formatNumber(token.marketData.totalBuyers24h)}
    - Unique Sellers (24h): ${formatNumber(token.marketData.totalSellers24h)}
    - Liquidity: $${formatNumber(token.marketData.liquidityUSD)}
    - FDV: $${formatNumber(token.marketData.fullyDilutedValuation)}
    ${token.marketData.marketCapRank ? `- Market Cap Rank: #${token.marketData.marketCapRank}` : ''}
    ${volumeComparison}
    ${bondingInfo}
  
    **On-Chain Metrics**:
    - Total Holders: ${formatNumber(token.onChainMetrics.holders.total)}
    - Top 10 Holders: ${token.onChainMetrics.holders.top10Percentage}% of supply
    - Top 50 Holders: ${token.onChainMetrics.holders.top50Percentage}% of supply
    
    **Holder Distribution**:
    - Whales: ${token.onChainMetrics.holders.distribution.whales}
    - Sharks: ${token.onChainMetrics.holders.distribution.sharks}
    - Dolphins: ${token.onChainMetrics.holders.distribution.dolphins}
    - Fish: ${token.onChainMetrics.holders.distribution.fish}
    - Octopus: ${token.onChainMetrics.holders.distribution.octopus}
    - Crabs: ${token.onChainMetrics.holders.distribution.crabs}
    - Shrimps: ${token.onChainMetrics.holders.distribution.shrimps}
    
    **Holder Acquisition**:
    - Via Swap: ${token.onChainMetrics.holders.acquisition.swap}
    - Via Transfer: ${token.onChainMetrics.holders.acquisition.transfer}
    - Via Airdrop: ${token.onChainMetrics.holders.acquisition.airdrop}
    
    **Holder Changes**:
    - 5min: ${token.onChainMetrics.holders.change['5min'].change} (${token.onChainMetrics.holders.change['5min'].changePercent}%)
    - 1h: ${token.onChainMetrics.holders.change['1h'].change} (${token.onChainMetrics.holders.change['1h'].changePercent}%)
    - 6h: ${token.onChainMetrics.holders.change['6h'].change} (${token.onChainMetrics.holders.change['6h'].changePercent}%)
    - 24h: ${token.onChainMetrics.holders.change['24h'].change} (${token.onChainMetrics.holders.change['24h'].changePercent}%)
    
    **Activity**:
    - Transactions (24h): ${formatNumber(token.onChainMetrics.activity.transactions24h)}
    - Large Transactions (24h): ${formatNumber(token.onChainMetrics.activity.largeTransactions24h)}
    - New Holders (24h): ${formatNumber(token.onChainMetrics.activity.newHolders24h)}
  
    **Security**:
    - ${token.security.verifiedCreator ? '✅ Verified creator' : '⚠️ Unverified creator'}
    - ${token.security.contractVerified ? '✅ Contract verified' : '⚠️ Contract not verified'}
    ${token.security.warnings?.length ? `- Warnings: ${token.security.warnings.join(', ')}` : ''}
    `;
};

// Prompt generator function
export const generateTokenAnalysisPrompt = (
  token: TokenAnalysisPrompt['tokenData'],
  newsArticles?: TokenAnalysisPrompt['newsArticles'],
): string => {
  const newsContext = newsArticles?.length
    ? `
    **Recent Market Context**:
    ${newsArticles
      .map(
        (article) => `
    - Title: ${article.title}
    - Updated At: ${article.updatedAt}
    - Content: ${article.content}
    - Source: ${article.link}
    `,
      )
      .join('\n')}
    `
    : '';

  return `
    **System Instruction**:
    Today is ${new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}
    You are a Solana SPL token analysis expert. Analyze the following token data and provide:
    - Clear technical assessment
    - Liquidity and market analysis
    - Holder concentration insights (consider that single contract or CEX cold wallets can hold most of token supply like bridge)
    - Security evaluation
    - Trading/investment considerations
    ${newsContext || '- Market context from recent news'}
    
    **Token Data**:
    ${formatTokenData(token)}
    
    **Response Requirements**:
    1. Start with a one-sentence overview
    2. Analyze key metrics in bullet points
    3. Highlight 2-3 most important findings
    4. Calculate ForgeScore (-100 to 100) - But do not explain the calculation process:
       Technical Factors (40 points):
       - Contract verification (+20)
       - Creator verification (+10)
       - Mint authority status (+10)
       
       Market Health (30 points):
       - Liquidity depth (+10)
       - Volume consistency across sources (+10)
       - Buy/Sell ratio balance (+10)
       
       Holder Metrics (20 points):
       - Top 10 holder concentration (-10 to +10)
       - Holder growth rate (+10)
       
       Social & Community (10 points):
       - Social media presence (+5)
       - Website quality (+5)
       
       Risk Multipliers:
       - Pump.fun deployment (x0.8 if suspicious patterns)
       - High holder concentration (x0.7 if >80% in top 10)
       - Low liquidity (x0.6 if <$10k)
       - Volume manipulation (x0.5 if sources differ by >50%)
       
       Final Score:
       - -100: Extreme risk (like FTX)
       - -50: High risk
       - 0: Neutral
       - 50: Good potential
       - 100: Maximum trust (like Bitcoin)

    5. Risk Assessment Matrix:
       Technical Risks:
       - Contract risks (unverified, suspicious code)
       - Creator risks (anonymous, unverified)
       - Deployment risks (suspicious platform)
       
       Market Risks:
       - Liquidity risks (low depth, concentrated)
       - Volume risks (manipulation, inconsistency)
       - Price risks (volatility, manipulation)
       
       Holder Risks:
       - Concentration risks (whale dominance)
       - Distribution risks (uneven spread)
       - Growth risks (stagnant or declining)
       
       Social Risks:
       - Community risks (low engagement)
       - Communication risks (poor transparency)
       - Brand risks (negative sentiment)

    6. Social Presence Analysis:
       Community Health:
       - Twitter engagement metrics
       - Website traffic and quality
       - Community growth rate
       - Developer activity
       
       Communication Quality:
       - Update frequency
       - Transparency level
       - Response to community
       - Crisis management

    7. Note deployment method:
       - If deployed via pump.fun:
         * Bonding progress analysis
         * Team transparency
         * Tokenomics review
       - If not:
         * Alternative deployment methods
         * Migration possibilities
         * Platform recommendations

    8. Use emojis sparingly for visual organization
    9. Note that this reponse is generated by AI engine and should not be used as financial advice.
    ${newsContext ? '10. Reference relevant market news when applicable' : ''}
    
    Format as a friendly but professional chat message.
    `;
};
