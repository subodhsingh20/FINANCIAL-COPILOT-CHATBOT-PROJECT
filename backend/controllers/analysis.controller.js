const {
  getPortfolioById,
  getPortfolioByUserId,
} = require('../services/cloudantService');
const { getPricesForAssets } = require('../services/priceService');
const { analyzePortfolio } = require('../services/portfolioAnalyzer');
const { generatePortfolioInsights } = require('../services/aiService');
const { validatePortfolioPayload } = require('../models/portfolio.model');

function buildPriceMap(priceResult, assets) {
  const map = {};
  const fallbackPrices = new Map(assets.map((asset) => [String(asset.symbol).trim().toUpperCase(), Number(asset.buyPrice) || 0]));

  assets.forEach((asset) => {
    const symbol = String(asset.symbol).trim().toUpperCase();
    const priceInfo = priceResult.prices?.[symbol];
    map[symbol] = priceInfo && Number(priceInfo.currentPrice) > 0
      ? priceInfo
      : {
          symbol,
          currentPrice: fallbackPrices.get(symbol) || 0,
          currency: 'INR',
          source: 'fallback-buy-price',
          asOf: new Date().toISOString(),
          changePercent: 0,
          volume: 0,
          marketCap: 0,
          fundamentals: {
            volume: 0,
            marketCap: 0,
            peRatio: 0,
            pbRatio: 0,
            dividendYield: 0,
            eps: 0,
            high52Week: 0,
            low52Week: 0,
          },
        };
  });

  return map;
}

function buildNormalizedHoldings(assets, priceMap) {
  const totalValue = assets.reduce((sum, asset) => {
    const symbol = String(asset.symbol).trim().toUpperCase();
    const priceInfo = priceMap[symbol];
    const currentPrice = Number(priceInfo?.currentPrice) || Number(asset.buyPrice) || 0;
    const quantity = Number(asset.quantity) || 0;
    return sum + currentPrice * quantity;
  }, 0);

  return assets.map((asset) => {
    const symbol = String(asset.symbol).trim().toUpperCase();
    const priceInfo = priceMap[symbol] || {};
    const currentPrice = Number(priceInfo.currentPrice) || Number(asset.buyPrice) || 0;
    const quantity = Number(asset.quantity) || 0;
    const holdingValue = currentPrice * quantity;

    return {
      ticker: symbol,
      allocationPercent: totalValue > 0 ? (holdingValue / totalValue) * 100 : 0,
      currentPrice,
      holdingValue,
      quantity,
      volume: Number(priceInfo.volume) || 0,
      fundamentals: priceInfo.fundamentals || {
        volume: 0,
        marketCap: 0,
        peRatio: 0,
        pbRatio: 0,
        dividendYield: 0,
        eps: 0,
        high52Week: 0,
        low52Week: 0,
      },
      currency: 'INR',
      source: priceInfo.source || 'fallback-buy-price',
      asOf: priceInfo.asOf || null,
    };
  });
}

async function resolvePortfolio(reqBody, userId) {
  if (reqBody?.portfolioId) {
    const portfolio = await getPortfolioById(reqBody.portfolioId);
    if (portfolio && portfolio.userId === userId) {
      return portfolio;
    }
    return null;
  }

  if (reqBody?.portfolio?.assets) {
    const { valid, assets, errors } = validatePortfolioPayload(reqBody.portfolio);
    if (!valid) {
      const error = new Error('Invalid portfolio payload');
      error.validationErrors = errors;
      throw error;
    }
    return {
      _id: reqBody.portfolio._id || null,
      userId,
      assets,
      createdAt: reqBody.portfolio.createdAt || new Date().toISOString(),
      updatedAt: reqBody.portfolio.updatedAt || new Date().toISOString(),
    };
  }

  return getPortfolioByUserId(userId);
}

async function analyzePortfolioController(req, res) {
  try {
    const portfolio = await resolvePortfolio(req.body, req.user.userId);

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    const { valid, assets, errors } = validatePortfolioPayload({ assets: portfolio.assets });
    if (!valid) {
      return res.status(400).json({ message: 'Invalid portfolio data', errors });
    }

    const priceResult = await getPricesForAssets(assets);
    const priceMap = buildPriceMap(priceResult, assets);
    const analysis = analyzePortfolio(assets, priceMap);
    const normalizedHoldings = buildNormalizedHoldings(assets, priceMap);
    const aiInsights = await generatePortfolioInsights({
      ...analysis,
      portfolioId: portfolio._id,
      userId: portfolio.userId,
      assetCount: assets.length,
      priceSource: priceResult.source,
      priceErrors: priceResult.errors || [],
      normalizedHoldings,
      marketData: priceMap,
    });

    const response = {
      currency: 'INR',
      liveDataSource: priceResult.source,
      aiSource: aiInsights.aiSource || 'fallback',
      score: aiInsights.score,
      risks: aiInsights.risks || aiInsights.keyMistakes || [],
      suggestions: aiInsights.suggestions || aiInsights.improvementSuggestions || [],
      projection: aiInsights.projection || aiInsights.fiveYearOutlook || '',
      totalValue: analysis.totalValue,
      allocation: analysis.allocation,
      diversificationScore: analysis.diversificationScore,
      riskLevel: analysis.riskLevel,
      warnings: [...analysis.warnings, ...(priceResult.errors || [])],
      aiInsights: {
        score: aiInsights.score,
        keyMistakes: aiInsights.risks || aiInsights.keyMistakes || [],
        improvementSuggestions: aiInsights.suggestions || aiInsights.improvementSuggestions || [],
        fiveYearOutlook: aiInsights.projection || aiInsights.fiveYearOutlook || '',
      },
      futureValueProjection: analysis.futureValueProjection,
      futureValueProjections: analysis.futureValueProjections,
      priceData: priceMap,
      normalizedHoldings,
    };

    return res.json(response);
  } catch (error) {
    if (error.validationErrors) {
      return res.status(400).json({
        message: 'Invalid portfolio payload',
        errors: error.validationErrors,
      });
    }

    console.error('Error analyzing portfolio:', error);
    return res.status(500).json({ message: 'Failed to analyze portfolio' });
  }
}

module.exports = {
  analyzePortfolioController,
};
