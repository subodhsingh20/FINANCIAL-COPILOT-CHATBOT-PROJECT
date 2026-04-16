require('dotenv').config({ path: __dirname + '/.env' });

const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const conversationRoutes = require('./routes/conversations');
const portfolioRoutes = require('./routes/portfolio.routes');
const analysisRoutes = require('./routes/analysis.routes');
const marketRoutes = require('./routes/market.routes');
const { initializeCloudant } = require('./services/cloudantService');

const app = express();
const port = Number(process.env.PORT) || 5000;
const frontendDistPath = path.resolve(__dirname, '../frontend/dist');

if (!process.env.CLOUDANT_URL) {
  console.error('Missing required environment variable: CLOUDANT_URL');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('Missing required environment variable: JWT_SECRET');
  process.exit(1);
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

app.get('/api/news', async (req, res) => {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ message: 'News service is not configured' });
  }

  try {
    const response = await fetch(`https://newsapi.org/v2/top-headlines?country=us&pageSize=4&apiKey=${apiKey}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch news');
    }

    res.json({
      articles: Array.isArray(data.articles) ? data.articles : [],
    });
  } catch (error) {
    console.error('News API error:', error.message);
    res.status(502).json({ message: 'Unable to fetch news right now' });
  }
});

app.get('/api/weather', async (req, res) => {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const { lat, lon } = req.query;

  if (!apiKey) {
    return res.status(503).json({ message: 'Weather service is not configured' });
  }

  if (!lat || !lon) {
    return res.status(400).json({ message: 'lat and lon are required query parameters' });
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&units=metric&appid=${apiKey}`
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch weather');
    }

    res.json(data);
  } catch (error) {
    console.error('Weather API error:', error.message);
    res.status(502).json({ message: 'Unable to fetch weather right now' });
  }
});

app.use('/api', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api', portfolioRoutes);
app.use('/api', analysisRoutes);
app.use('/api/market', marketRoutes);

app.get('/', (req, res) => {
  res.send('Backend server is running');
});

app.use(express.static(frontendDistPath, { index: false }));

app.get('/{*splat}', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }

  return res.sendFile(path.join(frontendDistPath, 'index.html'), (error) => {
    if (error) {
      next();
    }
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
