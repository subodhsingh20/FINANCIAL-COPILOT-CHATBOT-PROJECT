const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { analyzePortfolioController } = require('../controllers/analysis.controller');

const router = express.Router();

router.use(authMiddleware);

router.post('/analyze', analyzePortfolioController);

module.exports = router;
