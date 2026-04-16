# NexusAI Portfolio Dashboard

NexusAI is a full-stack portfolio analysis app with:

- React frontend
- Express backend
- Cloudant storage
- live market data from NSE
- AI portfolio analysis from Gemini

## Local Setup

### Backend

Copy `backend/.env.example` to `backend/.env` and fill in your values.

```env
PORT=5000
CLOUDANT_URL=https://username:password@your-cloudant-host
CLOUDANT_USERS_DB=users
CLOUDANT_CONVERSATIONS_DB=conversations
CLOUDANT_PORTFOLIOS_DB=portfolios
JWT_SECRET=your-long-random-secret
CORS_ORIGIN=http://localhost:5173
AI_API_KEY=
AI_MODEL=gemini-2.5-flash
AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta
ALPHA_VANTAGE_API_KEY=
PRICE_CACHE_TTL_MS=120000
```

Install and run from the repo root:

```bash
npm run setup
npm start
```

### Frontend

Copy `frontend/.env.example` to `frontend/.env` and set:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Run the frontend:

```bash
cd frontend
npm run dev
```

## Deployment

The app is now split across two services:

- Frontend: AWS Amplify
- Backend API: AWS Elastic Beanstalk

### Frontend

Set this Amplify environment variable:

```env
VITE_API_BASE_URL=https://your-backend.elasticbeanstalk.com
```

Amplify uses the root [`amplify.yml`](./amplify.yml) file to build the app from `frontend/`.

### Backend

Set these in Elastic Beanstalk environment properties:

```env
CLOUDANT_URL=https://username:password@your-cloudant-host
CLOUDANT_USERS_DB=users
CLOUDANT_CONVERSATIONS_DB=conversations
CLOUDANT_PORTFOLIOS_DB=portfolios
JWT_SECRET=replace-with-a-long-random-secret
CORS_ORIGIN=http://localhost:5173,https://your-frontend.amplifyapp.com
AI_API_KEY=your-gemini-api-key
AI_MODEL=gemini-2.5-flash
AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta
ALPHA_VANTAGE_API_KEY=
PRICE_CACHE_TTL_MS=120000
```

Use `/api/health` as the health check path.

### CI/CD flow

1. Push code from VS Code to GitHub.
2. GitHub Actions runs frontend and backend checks.
3. GitHub Actions deploys the backend package to Elastic Beanstalk.
4. Amplify rebuilds the frontend from the same GitHub branch.

## Checks

```bash
npm run check
npm run build
```

## Docker

Run the app as two Docker containers from the repo root:

```bash
docker compose up --build -d
```

View containers and logs:

```bash
docker ps
docker compose logs -f
```

Stop the stack:

```bash
docker compose down
```

Optional Docker Hub push:

```bash
docker login
docker build -t yourdockerhubuser/nexusai-backend ./backend
docker build -t yourdockerhubuser/nexusai-frontend --build-arg VITE_API_BASE_URL=http://localhost:5000 ./frontend
docker push yourdockerhubuser/nexusai-backend
docker push yourdockerhubuser/nexusai-frontend
```

## Notes

- `backend/server.js` is API-only now.
- Keep secrets in AWS environment variables, not in GitHub.
- CORS must include your Amplify domain and localhost for development.
