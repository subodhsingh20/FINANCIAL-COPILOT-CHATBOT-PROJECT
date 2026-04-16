const { isGoldAsset, isETF } = require('../utils/riskRules');

function safeNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function buildPriceLookup(prices = {}) {
  const lookup = new Map();

  Object.entries(prices).forEach(([symbol, priceInfo]) => {
    lookup.set(String(symbol).trim().toUpperCase(), {
      currentPrice: safeNumber(priceInfo?.currentPrice ?? priceInfo?.price),
      source: priceInfo?.source || 'unknown',
      asOf: priceInfo?.asOf || null,
      changePercent: safeNumber(priceInfo?.changePercent),
    });
  });

  return lookup;
}

function getCurrentPrice(asset, priceLookup) {
  const symbol = String(asset.symbol || '').trim().toUpperCase();
  const priceInfo = priceLookup.get(symbol);
  const currentPrice = safeNumber(priceInfo?.currentPrice);
  return currentPrice > 0 ? currentPrice : safeNumber(asset.buyPrice);
}

function calculateAssetValue(asset, priceLookup) {
  return getCurrentPrice(asset, priceLookup) * safeNumber(asset.quantity);
}

function calculateTotalValue(assets = [], prices = {}) {
  const priceLookup = buildPriceLookup(prices);

  return assets.reduce((sum, asset) => sum + calculateAssetValue(asset, priceLookup), 0);
}

function calculateAllocation(assets = [], prices = {}) {
  const priceLookup = buildPriceLookup(prices);
  const totalValue = calculateTotalValue(assets, prices);

  return assets.map((asset) => {
    const value = calculateAssetValue(asset, priceLookup);
    return {
      symbol: String(asset.symbol || '').trim().toUpperCase(),
      type: String(asset.type || '').trim().toUpperCase(),
      value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
    };
  });
}

function calculateProfitLoss(assets = [], prices = {}) {
  const priceLookup = buildPriceLookup(prices);

  const positions = assets.map((asset) => {
    const symbol = String(asset.symbol || '').trim().toUpperCase();
    const buyPrice = safeNumber(asset.buyPrice);
    const currentPrice = getCurrentPrice(asset, priceLookup);
    const quantity = safeNumber(asset.quantity);
    const profitLoss = (currentPrice - buyPrice) * quantity;
    const invested = buyPrice * quantity;
    const returnPercentage = invested > 0 ? (profitLoss / invested) * 100 : 0;

    return {
      symbol,
      type: String(asset.type || '').trim().toUpperCase(),
      quantity,
      buyPrice,
      currentPrice,
      invested,
      profitLoss,
      returnPercentage,
    };
  });

  const totalProfitLoss = positions.reduce((sum, position) => sum + position.profitLoss, 0);
  const totalInvested = positions.reduce((sum, position) => sum + position.invested, 0);

  return {
    positions,
    totalProfitLoss,
    totalInvested,
    returnPercentage: totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0,
  };
}

function calculateReturnPercentage(totalProfitLoss, totalInvested) {
  if (!Number.isFinite(totalInvested) || totalInvested <= 0) {
    return 0;
  }

  return (safeNumber(totalProfitLoss) / totalInvested) * 100;
}

function calculateDiversificationScore(assets = [], prices = {}) {
  if (!Array.isArray(assets) || assets.length === 0) {
    return 0;
  }

  const allocation = calculateAllocation(assets, prices);
  const uniqueTypes = new Set(assets.map((asset) => String(asset.type || '').trim().toUpperCase()).filter(Boolean));
  const concentration = Math.max(...allocation.map((entry) => entry.percentage), 0);
  let score = 20;

  if (assets.length === 1) {
    score = 20;
  } else {
    score += Math.min(25, assets.length * 8);
    score += Math.min(20, uniqueTypes.size * 6);
    score += Math.max(0, 25 - concentration / 2);
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function calculateRiskLevel(assets = [], prices = {}) {
  const allocation = calculateAllocation(assets, prices);
  const positions = calculateProfitLoss(assets, prices).positions;
  const totalValue = allocation.reduce((sum, item) => sum + item.value, 0);
  const highestAllocation = allocation.reduce((max, item) => Math.max(max, item.percentage), 0);
  const goldExposure = totalValue > 0
    ? positions
        .filter((position) => isGoldAsset(position))
        .reduce((sum, position) => sum + (position.currentPrice * position.quantity), 0) / totalValue
    : 0;
  const hasETF = assets.some((asset) => isETF(asset));

  let level = 'moderate';
  const reasons = [];

  if (assets.length === 1 || highestAllocation > 50) {
    level = 'high';
    reasons.push('Single-asset concentration is elevated.');
  }

  if (!hasETF) {
    level = level === 'high' ? 'high' : 'moderate';
    reasons.push('No ETF exposure increases idiosyncratic risk.');
  }

  if (goldExposure > 0.4) {
    level = 'conservative';
    reasons.push('More than 40% of the portfolio is allocated to gold-related assets.');
  }

  if (highestAllocation > 70) {
    level = 'very_high';
    reasons.push('A single position dominates the portfolio.');
  }

  if (assets.length > 3 && highestAllocation < 35 && hasETF) {
    level = 'low';
  }

  return {
    level,
    reasons,
    factors: {
      highestAllocation,
      goldExposure,
      hasETF,
    },
  };
}

function generateWarnings(assets = [], prices = {}) {
  const warnings = [];
  const allocation = calculateAllocation(assets, prices);
  const riskLevel = calculateRiskLevel(assets, prices);
  const highestAllocation = allocation.reduce((max, item) => Math.max(max, item.percentage), 0);
  const goldExposure = riskLevel.factors.goldExposure;
  const hasETF = riskLevel.factors.hasETF;

  if (assets.length === 0) {
    warnings.push('Portfolio is empty. Add at least one asset to analyze.');
  }

  if (highestAllocation > 50) {
    warnings.push('One asset represents more than 50% of the portfolio.');
  }

  if (goldExposure > 0.4) {
    warnings.push('Gold exposure exceeds 40% of the portfolio.');
  }

  if (!hasETF) {
    warnings.push('The portfolio has no ETFs, which can reduce diversification.');
  }

  if (riskLevel.level === 'very_high') {
    warnings.push('Portfolio concentration is very high.');
  }

  return warnings;
}

function calculateFutureValue(currentValue, annualReturnRate = 0.08, years = 5) {
  const value = safeNumber(currentValue);
  const rate = safeNumber(annualReturnRate);
  const duration = Math.max(0, safeNumber(years));

  return value * ((1 + rate) ** duration);
}

function buildProjectionSeries(currentValue, annualReturnRate = 0.08, yearsList = [3, 5, 10]) {
  return yearsList.reduce((series, years) => {
    const duration = Math.max(0, safeNumber(years));
    series[duration] = {
      years: duration,
      annualReturnRate,
      projectedValue: calculateFutureValue(currentValue, annualReturnRate, duration),
    };
    return series;
  }, {});
}

function analyzePortfolio(assets = [], prices = {}) {
  const totalValue = calculateTotalValue(assets, prices);
  const allocation = calculateAllocation(assets, prices);
  const profitLoss = calculateProfitLoss(assets, prices);
  const diversificationScore = calculateDiversificationScore(assets, prices);
  const riskLevel = calculateRiskLevel(assets, prices);
  const warnings = generateWarnings(assets, prices);
  const returnPercentage = calculateReturnPercentage(profitLoss.totalProfitLoss, profitLoss.totalInvested);
  const assumedAnnualReturn = riskLevel.level === 'low'
    ? 0.09
    : riskLevel.level === 'conservative'
      ? 0.055
      : riskLevel.level === 'high'
        ? 0.065
        : 0.075;

  return {
    totalValue,
    allocation,
    profitLoss: {
      ...profitLoss,
      returnPercentage,
    },
    returnPercentage,
    diversificationScore,
    riskLevel,
    warnings,
    futureValueProjection: {
      years: 5,
      annualReturnRate: assumedAnnualReturn,
      projectedValue: calculateFutureValue(totalValue, assumedAnnualReturn, 5),
    },
    futureValueProjections: buildProjectionSeries(totalValue, assumedAnnualReturn, [3, 5, 10]),
  };
}

module.exports = {
  calculateTotalValue,
  calculateAllocation,
  calculateProfitLoss,
  calculateReturnPercentage,
  calculateDiversificationScore,
  calculateRiskLevel,
  generateWarnings,
  calculateFutureValue,
  buildProjectionSeries,
  analyzePortfolio,
};
