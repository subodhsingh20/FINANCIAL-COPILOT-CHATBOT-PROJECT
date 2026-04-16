const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  createPortfolioController,
  getPortfolioController,
  getCurrentPortfolioController,
  updatePortfolioController,
  deletePortfolioController,
} = require('../controllers/portfolio.controller');

const router = express.Router();

router.use(authMiddleware);

router.get('/portfolio/me', getCurrentPortfolioController);
router.post('/portfolio', createPortfolioController);
router.get('/portfolio/:user', getPortfolioController);
router.put('/portfolio/:id', updatePortfolioController);
router.delete('/portfolio/:id', deletePortfolioController);

module.exports = router;
