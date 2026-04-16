const {
  createPortfolio,
  getPortfolioById,
  getPortfolioByUserId,
  updatePortfolio,
  deletePortfolio,
} = require('../services/cloudantService');
const { validatePortfolioPayload, normalizePortfolioOutput } = require('../models/portfolio.model');

function assertPortfolioOwnership(req, userId) {
  return req.user?.userId === userId;
}

async function createPortfolioController(req, res) {
  try {
    const { valid, errors, assets } = validatePortfolioPayload(req.body);
    if (!valid) {
      return res.status(400).json({ message: 'Invalid portfolio payload', errors });
    }

    const result = await createPortfolio({
      userId: req.user.userId,
      assets,
    });

    return res.status(result.created ? 201 : 200).json({
      portfolio: normalizePortfolioOutput(result.portfolio),
      created: result.created,
    });
  } catch (error) {
    console.error('Error creating portfolio:', error);
    return res.status(500).json({ message: 'Failed to create portfolio' });
  }
}

async function getPortfolioController(req, res) {
  try {
    const { user: userId } = req.params;
    if (!assertPortfolioOwnership(req, userId)) {
      return res.status(403).json({ message: 'You can only access your own portfolio' });
    }

    const portfolio = await getPortfolioByUserId(userId);
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    return res.json({ portfolio: normalizePortfolioOutput(portfolio) });
  } catch (error) {
    console.error('Error loading portfolio:', error);
    return res.status(500).json({ message: 'Failed to load portfolio' });
  }
}

async function getCurrentPortfolioController(req, res) {
  try {
    const portfolio = await getPortfolioByUserId(req.user.userId);

    return res.json({
      portfolio: portfolio ? normalizePortfolioOutput(portfolio) : null,
    });
  } catch (error) {
    console.error('Error loading current portfolio:', error);
    return res.status(500).json({ message: 'Failed to load portfolio' });
  }
}

async function updatePortfolioController(req, res) {
  try {
    const { valid, errors, assets } = validatePortfolioPayload(req.body);
    if (!valid) {
      return res.status(400).json({ message: 'Invalid portfolio payload', errors });
    }

    const portfolio = await getPortfolioById(req.params.id);
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    if (!assertPortfolioOwnership(req, portfolio.userId)) {
      return res.status(403).json({ message: 'You can only update your own portfolio' });
    }

    const updated = await updatePortfolio(req.params.id, req.user.userId, { assets });
    if (!updated) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    return res.json({
      portfolio: normalizePortfolioOutput(updated),
    });
  } catch (error) {
    console.error('Error updating portfolio:', error);
    return res.status(500).json({ message: 'Failed to update portfolio' });
  }
}

async function deletePortfolioController(req, res) {
  try {
    const portfolio = await getPortfolioById(req.params.id);
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    if (!assertPortfolioOwnership(req, portfolio.userId)) {
      return res.status(403).json({ message: 'You can only delete your own portfolio' });
    }

    const deleted = await deletePortfolio(req.params.id, req.user.userId);
    if (!deleted) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting portfolio:', error);
    return res.status(500).json({ message: 'Failed to delete portfolio' });
  }
}

module.exports = {
  createPortfolioController,
  getPortfolioController,
  getCurrentPortfolioController,
  updatePortfolioController,
  deletePortfolioController,
};
