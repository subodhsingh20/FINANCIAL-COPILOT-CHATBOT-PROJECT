const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

function loadEnvFile(filePath, { onlyMissing = false } = {}) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  const parsed = dotenv.parse(fs.readFileSync(filePath));
  Object.entries(parsed).forEach(([key, value]) => {
    if (!onlyMissing || !process.env[key]) {
      process.env[key] = value;
    }
  });

  return true;
}

loadEnvFile(path.join(__dirname, '.env'), { onlyMissing: true });
loadEnvFile(path.join(__dirname, '.env.prod'), { onlyMissing: true });

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const conversationRoutes = require('./routes/conversations');
const portfolioRoutes = require('./routes/portfolio.routes');
const analysisRoutes = require('./routes/analysis.routes');
const marketRoutes = require('./routes/market.routes');
const { initializeCloudant } = require('./services/cloudantService');

const app = express();
const port = Number(process.env.PORT) || 5000;

function isPlaceholderCloudantUrl(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return !normalized
    || normalized.includes('your-cloudant-host')
    || normalized.includes('username:password@')
    || normalized.includes('replace-with-a-long-random-secret');
}

if (isPlaceholderCloudantUrl(process.env.CLOUDANT_URL)) {
  console.error(
    'Invalid CLOUDANT_URL. Replace the placeholder with your real Cloudant instance URL, for example: https://username:password@your-account.cloudantnosqldb.appdomain.cloud'
  );
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('Missing required environment variable: JWT_SECRET');
  process.exit(1);
}

if (process.env.AI_API_KEY) {
  console.log(`AI provider configured: ${process.env.AI_MODEL || 'gemini-2.5-flash'}`);
} else {
  console.warn('AI_API_KEY is missing at runtime. Chat will use demo mode until it is provided.');
}

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

function normalizeOrigin(origin) {
  try {
    const url = new URL(origin);
    return `${url.protocol}//${url.hostname}:${url.port || (url.protocol === 'https:' ? '443' : '80')}`;
  } catch {
    return origin;
  }
}

function isAllowedOrigin(origin) {
  if (!origin || allowedOrigins.length === 0) {
    return true;
  }

  const normalizedOrigin = normalizeOrigin(origin);
  const normalizedAllowedOrigins = allowedOrigins.map(normalizeOrigin);

  if (normalizedAllowedOrigins.includes(normalizedOrigin)) {
    return true;
  }

  try {
    const url = new URL(origin);
    const isLocalDevOrigin = ['localhost', '127.0.0.1'].includes(url.hostname);
    return isLocalDevOrigin;
  } catch {
    return false;
  }
}

app.disable('x-powered-by');
app.use(cors({
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    console.error(`Blocked by CORS: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

app.use((req, res, next) => {
  if (!res.getHeader('Cache-Control')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  }

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'DENY');

  next();
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api', portfolioRoutes);
app.use('/api', analysisRoutes);
app.use('/api/market', marketRoutes);

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'nexusai-backend',
    message: 'Backend API server is running',
  });
});

async function startServer() {
  try {
    await initializeCloudant();
    console.log('Successfully connected to Cloudant');

    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`Server running on port ${port}`);
    });

    const shutdown = (signal) => {
      console.log(`${signal} received, shutting down gracefully`);
      server.close(() => {
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('Error connecting to Cloudant:', error.message);
    process.exit(1);
  }
}

startServer();
