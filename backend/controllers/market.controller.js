const { searchAssets, getQuoteSnapshots, getAssetHistory } = require('../services/marketDataService');

async function searchMarketAssetsController(req, res) {
  try {
    const query = String(req.query.q || '').trim();
    if (!query) {
      return res.status(400).json({ message: 'q is required' });
    }

    const results = await searchAssets(query);
    return res.json({
      query,
      results,
      count: results.length,
    });
  } catch (error) {
    console.error('Market search error:', error);
    return res.status(502).json({
      message: 'Unable to search market data right now',
    });
  }
}

async function getMarketQuotesController(req, res) {
  try {
    const symbols = String(req.query.symbols || '')
      .split(',')
      .map((symbol) => symbol.trim())
      .filter(Boolean);

    if (!symbols.length) {
      return res.status(400).json({ message: 'symbols is required' });
    }

    const quotes = await getQuoteSnapshots(symbols);
    return res.json({
      symbols,
      quotes,
    });
  } catch (error) {
    console.error('Market quotes error:', error);
    return res.status(502).json({
      message: 'Unable to fetch market quotes right now',
    });
  }
}

async function getMarketHistoryController(req, res) {
  try {
    const symbol = String(req.params.symbol || '').trim();
    if (!symbol) {
      return res.status(400).json({ message: 'symbol is required' });
    }

    const history = await getAssetHistory(symbol, {
      range: req.query.range,
      interval: req.query.interval,
    });

    return res.json(history);
  } catch (error) {
    console.error('Market history error:', error);
    return res.status(502).json({
      message: 'Unable to fetch market history right now',
    });
  }
}

module.exports = {
  searchMarketAssetsController,
  getMarketQuotesController,
  getMarketHistoryController,
};
