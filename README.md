# NOVA AI Portfolio Dashboard

NOVA AI is a full-stack portfolio analysis app with:

- React frontend
- Express backend
- Cloudant storage
- live market data from NSE
- AI portfolio analysis from deterministic portfolio rules

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
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=openrouter/free
ALPHA_VANTAGE_API_KEY=
PRICE_CACHE_TTL_MS=120000
```

Install and run from the repo root:

```bash
npm run setup
npm start
```

### Frontend

For local development, the frontend uses the Vite proxy in `frontend/vite.config.js`, so you can run it without setting an API URL.

If you want to build the frontend against a deployed backend, set:

```env
VITE_API_BASE_URL=https://your-backend-domain
```

Run the frontend:

```bash
cd frontend
npm run dev
```

## Deployment

This repository now supports a Docker-based CI/CD flow:

- VS Code -> GitHub -> Docker Hub
- GitHub Actions builds and pushes two images:
  - `nova-ai-backend`
  - `nova-ai-frontend`

### CI/CD flow

1. Push code from VS Code to GitHub.
2. GitHub Actions runs backend and frontend checks.
3. GitHub Actions builds the Docker images.
4. GitHub Actions pushes the images to Docker Hub.
5. Your runtime platform pulls the images from Docker Hub.

### Required GitHub settings

Add these repository secrets:

```env
DOCKERHUB_USERNAME=your-dockerhub-username
DOCKERHUB_TOKEN=your-dockerhub-access-token
```

### Runtime environment variables

Set these on the platform that runs the backend container:

```env
CLOUDANT_URL=https://username:password@your-cloudant-host
CLOUDANT_USERS_DB=users
CLOUDANT_CONVERSATIONS_DB=conversations
CLOUDANT_PORTFOLIOS_DB=portfolios
JWT_SECRET=replace-with-a-long-random-secret
CORS_ORIGIN=http://localhost:5173,https://your-frontend-url
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=openrouter/free
ALPHA_VANTAGE_API_KEY=
PRICE_CACHE_TTL_MS=120000
```

Use `/api/health` as the health check path for the backend service.

### Run from Docker Hub

For a production-style Docker Compose deployment, copy `backend/.env.prod.example` to `backend/.env.prod`, fill in your secrets, and then start the published images. The production compose file is locked to the `subodhsingh20` Docker Hub namespace so it does not depend on a shell variable:

```bash
docker compose -f docker-compose.prod.yml up -d
```

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
docker build -t yourdockerhubuser/nova-ai-backend ./backend
docker build -t yourdockerhubuser/nova-ai-frontend --build-arg VITE_API_BASE_URL=http://localhost:5000 ./frontend
docker push yourdockerhubuser/nova-ai-backend
docker push yourdockerhubuser/nova-ai-frontend
```

## Notes

- `backend/server.js` is API-only now.
- Keep secrets in your runtime environment, not in GitHub.
- CORS must include your frontend domain and localhost for development.
