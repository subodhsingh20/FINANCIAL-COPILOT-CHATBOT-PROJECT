# Frontend + Backend Deployment Guide

This project now deploys as two separate services:

- Frontend on AWS Amplify
- Backend API on AWS Elastic Beanstalk

The backend no longer serves the React build. Amplify owns the UI, and the backend only serves API routes.

## Keep in the repo

- `backend/`
- `frontend/`
- `.github/workflows/deploy.yml`
- `amplify.yml`
- `package.json`
- `package-lock.json`

## Remove from the repo

- `Dockerfile`
- `.dockerignore`
- `Procfile`
- `ecs-task.json`
- `.ebignore`
- `.elasticbeanstalk/config.yml`

## Frontend on Amplify

1. Connect the GitHub repo to AWS Amplify.
2. Use the root [`amplify.yml`](./amplify.yml) file.
3. Set this Amplify environment variable:

```env
VITE_API_BASE_URL=https://your-backend.elasticbeanstalk.com
```

4. Amplify builds the React app from `frontend/`.

## Backend on Elastic Beanstalk

1. Deploy the `backend/` folder as the source bundle.
2. Use the Node.js Elastic Beanstalk platform.
3. Set these environment variables in Beanstalk:

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

4. Use `/api/health` as the health check path.

## CI/CD flow

1. Push code from VS Code to GitHub.
2. GitHub Actions runs frontend and backend checks.
3. GitHub Actions packages the backend and deploys it to Elastic Beanstalk.
4. Amplify rebuilds the frontend from the same GitHub branch.

## Local checks

```bash
npm run check
npm run build
```

## Notes

- `backend/server.js` is API-only now.
- Keep secrets in AWS environment variables, not in GitHub.
- CORS must include your Amplify domain and localhost for development.
