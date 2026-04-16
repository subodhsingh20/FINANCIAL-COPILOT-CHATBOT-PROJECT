const ALLOWED_TYPES = new Set(['ETF', 'STOCK', 'MF']);

function toNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : NaN;
}

function sanitizeSymbol(symbol) {
  return String(symbol || '').trim().toUpperCase();
}

function sanitizeAsset(asset) {
  return {
    symbol: sanitizeSymbol(asset.symbol),
    type: String(asset.type || '').trim().toUpperCase(),
    quantity: toNumber(asset.quantity),
    buyPrice: toNumber(asset.buyPrice),
  };
}

function validateAsset(asset, index) {
  const normalized = sanitizeAsset(asset);
  const errors = [];

  if (!normalized.symbol) {
    errors.push(`assets[${index}].symbol is required`);
  }

  if (!ALLOWED_TYPES.has(normalized.type)) {
    errors.push(`assets[${index}].type must be one of ETF, STOCK, MF`);
  }

  if (!Number.isFinite(normalized.quantity) || normalized.quantity <= 0) {
    errors.push(`assets[${index}].quantity must be a number greater than 0`);
  }

  if (!Number.isFinite(normalized.buyPrice) || normalized.buyPrice < 0) {
    errors.push(`assets[${index}].buyPrice must be a non-negative number`);
  }

  return {
    value: normalized,
    errors,
  };
}

function validatePortfolioPayload(payload = {}) {
  const errors = [];
  const assetsInput = Array.isArray(payload.assets) ? payload.assets : [];

  if (!Array.isArray(payload.assets)) {
    errors.push('assets must be an array');
  }

  if (assetsInput.length === 0) {
    errors.push('at least one asset is required');
  }

  const assets = assetsInput.map((asset, index) => {
    const result = validateAsset(asset, index);
    errors.push(...result.errors);
    return result.value;
  });

  const uniqueSymbols = new Set();
  assets.forEach((asset, index) => {
    if (!asset.symbol) {
      return;
    }

    const key = asset.symbol;
    if (uniqueSymbols.has(key)) {
      errors.push(`assets[${index}].symbol duplicates an earlier asset`);
    }
    uniqueSymbols.add(key);
  });

  return {
    valid: errors.length === 0,
    errors,
    assets,
  };
}

function normalizePortfolioOutput(portfolio) {
  return {
    _id: portfolio._id,
    userId: portfolio.userId,
    assets: Array.isArray(portfolio.assets) ? portfolio.assets.map(sanitizeAsset) : [],
    createdAt: portfolio.createdAt,
    updatedAt: portfolio.updatedAt,
  };
}

module.exports = {
  ALLOWED_TYPES,
  sanitizeAsset,
  sanitizeSymbol,
  validateAsset,
  validatePortfolioPayload,
  normalizePortfolioOutput,
};
