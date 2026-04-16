const express = require('express');
const {
  searchMarketAssetsController,
  getMarketQuotesController,
  getMarketHistoryController,
} = require('../controllers/market.controller');

const router = express.Router();

router.get('/search', searchMarketAssetsController);
router.get('/quotes', getMarketQuotesController);
router.get('/:symbol/history', getMarketHistoryController);

module.exports = router;
