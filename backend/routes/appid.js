const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { WebAppStrategy } = require('ibmcloud-appid');
const { upsertAppIdUser } = require('../services/cloudantService');

const router = express.Router();

function getFrontendBaseUrl() {
  return (process.env.FRONTEND_BASE_URL || 'http://localhost:5173').replace(/\/$/, '');
}

function getAuthCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  };
}

router.get('/appid/login', (req, res, next) => {
  passport.authenticate(WebAppStrategy.STRATEGY_NAME, {
    forceLogin: true,
  })(req, res, next);
});

router.all(
  '/appid/callback',
  passport.authenticate(WebAppStrategy.STRATEGY_NAME, {
    keepSessionInfo: true,
    failureRedirect: `${getFrontendBaseUrl()}/login`,
  }),
  async (req, res, next) => {
    try {
      const user = await upsertAppIdUser(req.user);

      const token = jwt.sign(
        {
          userId: user._id,
          authProvider: 'ibm-app-id',
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.cookie('auth_token', token, getAuthCookieOptions());
      return res.redirect(getFrontendBaseUrl());
    } catch (error) {
      next(error);
    }
  }
);

router.get('/appid/logout', (req, res) => {
  const frontendBaseUrl = getFrontendBaseUrl();

  req.logout((err) => {
    if (err) {
      console.error('App ID logout error:', err);
    }

    res.clearCookie('auth_token', getAuthCookieOptions());

    if (req.session) {
      req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.redirect(frontendBaseUrl);
      });
      return;
    }

    res.redirect(frontendBaseUrl);
  });
});

module.exports = router;
