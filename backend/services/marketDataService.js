const { fetchPrices, normalizeSymbol } = require('./priceService');

function normalizeAssetType(value) {
  const type = String(value || '').trim().toUpperCase();
  if (type === 'ETF' || type === 'MUTUALFUND' || type === 'MF') {
    return type === 'MF' ? 'MF' : type;
  }

  return 'STOCK';
}

function mapYahooResult(result) {
  const symbol = normalizeSymbol(result.symbol);
  if (!symbol) {
    return null;
  }

  const quoteType = String(result.quoteType || result.typeDisp || '').trim().toUpperCase();
  const assetType = quoteType === 'ETF'
    ? 'ETF'
    : quoteType === 'MUTUALFUND' || quoteType === 'MUTUAL FUND'
      ? 'MF'
      : 'STOCK';

  return {
    symbol,
    name: result.shortname || result.longname || result.name || symbol,
    type: assetType,
    exchange: result.exchange || result.exchDisp || '',
    currency: result.currency || 'USD',
    marketState: result.marketState || result.exchangeState || '',
    currentPrice: Number(result.regularMarketPrice) || 0,
    changePercent: Number(result.regularMarketChangePercent) || 0,
    source: 'yahoo-finance',
  };
}

async function searchYahooFinance(query) {
  const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'NOVA-AI-Financial-Copilot/1.0',
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.finance?.error || data?.message || 'Yahoo Finance search failed');
  }

  const quotes = Array.isArray(data?.quotes) ? data.quotes : [];
  return quotes
    .map(mapYahooResult)
    .filter(Boolean)
    .filter((item) => ['STOCK', 'ETF', 'MF'].includes(item.type));
}

async function searchAlphaVantage(query) {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) {
    return [];
  }

  const endpoint = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${encodeURIComponent(apiKey)}`;
  const response = await fetch(endpoint, {
    headers: { Accept: 'application/json' },
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.Note || data?.ErrorMessage || 'Alpha Vantage search failed');
  }

  const matches = Array.isArray(data?.bestMatches) ? data.bestMatches : [];
  const symbolList = matches
    .slice(0, 8)
    .map((match) => ({
      symbol: normalizeSymbol(match['1. symbol']),
      name: match['2. name'] || match['1. symbol'],
      type: 'STOCK',
      exchange: match['4. region'] || match['3. type'] || '',
      currency: match['8. currency'] || 'USD',
      marketState: 'REGULAR',
      currentPrice: 0,
      changePercent: 0,
      source: 'alpha-vantage',
    }))
    .filter((item) => item.symbol);

  return symbolList;
}

async function searchAssets(query) {
  const trimmed = String(query || '').trim();
  if (!trimmed) {
    return [];
  }

  try {
    const yahooResults = await searchYahooFinance(trimmed);
    if (yahooResults.length > 0) {
      return yahooResults;
    }
  } catch (error) {
    console.warn('Yahoo Finance search failed, trying Alpha Vantage:', error.message);
  }

  try {
    const alphaResults = await searchAlphaVantage(trimmed);
    if (alphaResults.length > 0) {
      return alphaResults;
    }
  } catch (error) {
    console.warn('Alpha Vantage search failed:', error.message);
  }

  return [];
}

async function getQuoteSnapshots(symbols = []) {
  const normalizedSymbols = [...new Set(symbols.map(normalizeSymbol).filter(Boolean))];
  if (!normalizedSymbols.length) {
    return {};
  }

  const quoteData = await fetchPrices(normalizedSymbols);
  return quoteData.prices || {};
}

function normalizeHistoryRange(range) {
  const allowed = new Set(['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y', 'max']);
  const normalized = String(range || '1y').trim();
  return allowed.has(normalized) ? normalized : '1y';
}

function normalizeHistoryInterval(range, interval) {
  const preferred = String(interval || '').trim();
  if (preferred) {
    return preferred;
  }

  if (range === '1d' || range === '5d') {
    return '5m';
  }

  if (range === '1mo' || range === '3mo' || range === '6mo') {
    return '1d';
  }

  if (range === '1y' || range === '2y' || range === '5y' || range === '10y' || range === 'max') {
    return '1wk';
  }

  return '1d';
}

function parseYahooHistory(data, symbol, range, interval) {
  const result = data?.chart?.result?.[0];
  const timestamps = Array.isArray(result?.timestamp) ? result.timestamp : [];
  const quote = result?.indicators?.quote?.[0] || {};
  const adjclose = result?.indicators?.adjclose?.[0]?.adjclose || [];

  const points = timestamps
    .map((timestamp, index) => ({
      timestamp: new Date(timestamp * 1000).toISOString(),
      open: Number(quote.open?.[index]) || null,
      high: Number(quote.high?.[index]) || null,
      low: Number(quote.low?.[index]) || null,
      close: Number(adjclose[index] ?? quote.close?.[index]) || null,
      volume: Number(quote.volume?.[index]) || 0,
    }))
    .filter((point) => point.close !== null);

  return {
    symbol,
    range,
    interval,
    source: 'yahoo-finance',
    points,
    meta: {
      currency: result?.meta?.currency || 'USD',
      exchangeName: result?.meta?.exchangeName || '',
      regularMarketPrice: Number(result?.meta?.regularMarketPrice) || 0,
      previousClose: Number(result?.meta?.chartPreviousClose) || 0,
      currentPrice: Number(result?.meta?.regularMarketPrice) || 0,
    },
  };
}

async function fetchYahooHistory(symbol, range, interval) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${encodeURIComponent(range)}&interval=${encodeURIComponent(interval)}&includePrePost=false&events=div%2Csplits`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'NOVA-AI-Financial-Copilot/1.0',
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.chart?.error) {
    throw new Error(data?.chart?.error?.description || data?.message || 'Yahoo Finance chart request failed');
  }

  return parseYahooHistory(data, symbol, range, interval);
}

async function fetchAlphaVantageHistory(symbol) {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) {
    return null;
  }

  const endpoint = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&outputsize=compact&symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(apiKey)}`;
  const response = await fetch(endpoint, {
    headers: { Accept: 'application/json' },
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data?.['Error Message'] || data?.Note) {
    throw new Error(data?.['Error Message'] || data?.Note || 'Alpha Vantage history failed');
  }

  const series = data?.['Time Series (Daily)'] || {};
  const points = Object.entries(series)
    .slice(0, 180)
    .reverse()
    .map(([date, values]) => ({
      timestamp: `${date}T00:00:00.000Z`,
      open: Number(values['1. open']) || null,
      high: Number(values['2. high']) || null,
      low: Number(values['3. low']) || null,
      close: Number(values['4. close']) || null,
      volume: Number(values['6. volume']) || 0,
    }))
    .filter((point) => point.close !== null);

  return {
    symbol,
    range: '1y',
    interval: '1d',
    source: 'alpha-vantage',
    points,
    meta: {
      currency: 'USD',
      exchangeName: '',
      regularMarketPrice: points.at(-1)?.close || 0,
      previousClose: points.at(-2)?.close || 0,
      currentPrice: points.at(-1)?.close || 0,
    },
  };
}

async function getAssetHistory(symbol, options = {}) {
  const normalizedSymbol = normalizeSymbol(symbol);
  const range = normalizeHistoryRange(options.range);
  const interval = normalizeHistoryInterval(range, options.interval);

  try {
    return await fetchYahooHistory(normalizedSymbol, range, interval);
  } catch (error) {
    const fallback = await fetchAlphaVantageHistory(normalizedSymbol);
    if (fallback) {
      return fallback;
    }
    throw error;
  }
}

module.exports = {
  searchAssets,
  getQuoteSnapshots,
  getAssetHistory,
  normalizeAssetType,
};
