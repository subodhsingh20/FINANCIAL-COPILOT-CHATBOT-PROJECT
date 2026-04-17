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

This repository now supports a Docker-based CI/CD flow:

- VS Code -> GitHub -> Docker Hub
- GitHub Actions builds and pushes two images:
  - `nexusai-backend`
  - `nexusai-frontend`

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
AI_API_KEY=your-gemini-api-key
AI_MODEL=gemini-2.0-flash
AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta
ALPHA_VANTAGE_API_KEY=
PRICE_CACHE_TTL_MS=120000
```

Use `/api/health` as the health check path for the backend service.

### Run from Docker Hub

For a production-style Docker Compose deployment, copy `backend/.env.prod.example` to `backend/.env.prod`, fill in your secrets, set `DOCKERHUB_USERNAME` in your shell, then start the published images:

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
docker build -t yourdockerhubuser/nexusai-backend ./backend
docker build -t yourdockerhubuser/nexusai-frontend --build-arg VITE_API_BASE_URL=http://localhost:5000 ./frontend
docker push yourdockerhubuser/nexusai-backend
docker push yourdockerhubuser/nexusai-frontend
```

## Notes

- `backend/server.js` is API-only now.
- Keep secrets in your runtime environment, not in GitHub.
- CORS must include your frontend domain and localhost for development.
