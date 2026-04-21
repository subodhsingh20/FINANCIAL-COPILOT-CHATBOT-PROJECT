const CACHE_TTL_MS = Number(process.env.PRICE_CACHE_TTL_MS) || 2 * 60 * 1000;
const NSE_API_BASE_URL = (process.env.NSE_API_BASE_URL || 'https://nse-api-ruby.vercel.app').replace(/\/$/, '');
const cache = new Map();

function normalizeSymbol(symbol) {
  return String(symbol || '').trim().toUpperCase();
}

function getCacheKey(symbols) {
  return symbols.map(normalizeSymbol).filter(Boolean).sort().join(',');
}

function getCachedEntry(key) {
  const entry = cache.get(key);
  if (!entry) {
    return null;
  }

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.payload;
}

function setCachedEntry(key, payload) {
  cache.set(key, {
    payload,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

function unwrapValue(value) {
  if (value == null) {
    return null;
  }

  if (typeof value === 'object') {
    if (Object.prototype.hasOwnProperty.call(value, 'value')) {
      return unwrapValue(value.value);
    }

    if (Object.prototype.hasOwnProperty.call(value, 'price')) {
      return unwrapValue(value.price);
    }

    if (Object.prototype.hasOwnProperty.call(value, 'text')) {
      return unwrapValue(value.text);
    }
  }

  return value;
}

function toNumber(value) {
  const unwrapped = unwrapValue(value);
  if (typeof unwrapped === 'string') {
    const normalized = unwrapped.replace(/[,₹$]/g, '').trim();
    if (!normalized) {
      return 0;
    }

    const numeric = Number(normalized);
    return Number.isFinite(numeric) ? numeric : 0;
  }

  const numeric = Number(unwrapped);
  return Number.isFinite(numeric) ? numeric : 0;
}

function extractCollection(payload) {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  if (Array.isArray(payload.results)) {
    return payload.results;
  }

  if (Array.isArray(payload.stocks)) {
    return payload.stocks;
  }

  if (Array.isArray(payload.items)) {
    return payload.items;
  }

  if (typeof payload !== 'object') {
    return [];
  }

  if (payload.symbol || payload.ticker || payload.currentPrice || payload.price || payload.lastPrice) {
    return [payload];
  }

  return Object.entries(payload)
    .filter(([key, value]) => {
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return false;
      }

      return !['message', 'status', 'endpoints', 'features', 'exchange', 'usage_guide', 'response_formats', 'version'].includes(key);
    })
    .map(([symbol, value]) => ({
      symbol,
      ...value,
    }));
}

function parseFundamentals(raw = {}) {
  return {
    volume: toNumber(raw.volume ?? raw.totalTradedVolume ?? raw.tradedVolume ?? raw.qtyTraded),
    marketCap: toNumber(raw.marketCap ?? raw.market_cap ?? raw.marketCapitalization),
    peRatio: toNumber(raw.peRatio ?? raw.pe_ratio ?? raw.trailingPE ?? raw.pe ?? raw.priceEarningsRatio),
    pbRatio: toNumber(raw.pbRatio ?? raw.priceToBook ?? raw.priceToBookRatio),
    dividendYield: toNumber(raw.dividendYield ?? raw.dividend_yield),
    eps: toNumber(raw.eps ?? raw.earningsPerShare),
    high52Week: toNumber(raw.high52Week ?? raw.week_52_high ?? raw['52WeekHigh'] ?? raw.fiftyTwoWeekHigh),
    low52Week: toNumber(raw.low52Week ?? raw.week_52_low ?? raw['52WeekLow'] ?? raw.fiftyTwoWeekLow),
  };
}

function parseStockRecord(raw = {}, fallbackSymbol = '') {
  const symbol = normalizeSymbol(raw.symbol || raw.ticker || raw.tradingSymbol || fallbackSymbol);
  const currentPrice = toNumber(
    raw.currentPrice
      ?? raw.price
      ?? raw.lastPrice
      ?? raw.ltp
      ?? raw.close
      ?? raw.last
      ?? raw.regularMarketPrice
  );
  const changePercent = toNumber(
    raw.changePercent
      ?? raw.change_percent
      ?? raw.percentChange
      ?? raw.regularMarketChangePercent
      ?? raw.dayChangePercent
      ?? raw.day_change_perc
  );
  const fundamentals = parseFundamentals(raw);

  return {
    symbol,
    currentPrice,
    currency: 'INR',
    changePercent,
    volume: fundamentals.volume,
    marketCap: fundamentals.marketCap,
    fundamentals,
    source: raw.source || 'nse-api-ruby',
    asOf: raw.asOf || raw.timestamp || new Date().toISOString(),
    raw,
  };
}

async function fetchJson(url, headers = {}) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'NOVA-AI-Financial-Copilot/1.0',
      ...headers,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || data?.error || `Request failed with status ${response.status}`);
  }

  return data;
}

async function fetchNseJson(path) {
  return fetchJson(`${NSE_API_BASE_URL}${path}`, {
    'User-Agent': 'NOVA-AI-Financial-Copilot/1.0',
  });
}

async function fetchNsePrices(symbols) {
  if (symbols.length === 0) {
    return {};
  }

  const listData = await fetchNseJson(`/stock/list?symbols=${encodeURIComponent(symbols.join(','))}&res=num`);
  const collection = extractCollection(listData);
  const prices = {};

  collection.forEach((entry) => {
    const parsed = parseStockRecord(entry, entry?.symbol || entry?.ticker);
    if (parsed.symbol) {
      prices[parsed.symbol] = parsed;
    }
  });

  return prices;
}

async function fetchNseSinglePrice(symbol) {
  const data = await fetchNseJson(`/stock?symbol=${encodeURIComponent(symbol)}&res=num`);
  const collection = extractCollection(data);
  const record = collection[0] || data;
  const parsed = parseStockRecord(record, symbol);

  if (!parsed.symbol) {
    parsed.symbol = normalizeSymbol(symbol);
  }

  return parsed;
}

async function fetchPrices(symbols = []) {
  const normalizedSymbols = [...new Set(symbols.map(normalizeSymbol).filter(Boolean))];
  if (normalizedSymbols.length === 0) {
    return { prices: {}, source: 'empty' };
  }

  const cacheKey = getCacheKey(normalizedSymbols);
  const cached = getCachedEntry(cacheKey);
  if (cached) {
    return {
      ...cached,
      cacheHit: true,
    };
  }

  const result = {
    prices: {},
    source: 'nse-api-ruby',
    errors: [],
    cacheHit: false,
  };

  try {
    result.prices = await fetchNsePrices(normalizedSymbols);
  } catch (error) {
    result.errors.push(error.message);

    const fallbackPrices = {};
    await Promise.all(normalizedSymbols.map(async (symbol) => {
      try {
        fallbackPrices[symbol] = await fetchNseSinglePrice(symbol);
      } catch (fallbackError) {
        result.errors.push(`${symbol}: ${fallbackError.message}`);
      }
    }));

    result.prices = fallbackPrices;
    result.source = 'nse-api-ruby-fallback';
  }

  setCachedEntry(cacheKey, result);
  return result;
}

async function getPricesForAssets(assets = []) {
  const symbols = assets.map((asset) => asset.symbol);
  return fetchPrices(symbols);
}

function clearPriceCache() {
  cache.clear();
}

module.exports = {
  fetchPrices,
  getPricesForAssets,
  clearPriceCache,
  normalizeSymbol,
  parseStockRecord,
};
