# NexusAI

NexusAI is a modern full-stack chatbot app with authentication, persistent conversation history, customizable assistant behavior, markdown rendering, code formatting, and a backend AI gateway.

## What It Does

- User registration and login with JWT auth
- Persistent local chat history per user
- Backend chat endpoint at `/api/chat`
- Configurable system prompt and creativity controls
- Markdown and syntax-highlighted assistant responses
- Copy, regenerate, and voice-input actions
- Real AI provider support through environment variables
- Demo fallback mode when AI credentials are not configured

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Framer Motion
- Backend: Express, MongoDB, Mongoose, JWT

## Local Setup

### 1. Backend

Copy `backend/.env.example` to `backend/.env` and fill in your values:

```env
PORT=5000
CLOUDANT_URL=https://username:password@your-cloudant-host
CLOUDANT_USERS_DB=users
CLOUDANT_CONVERSATIONS_DB=conversations
JWT_SECRET=your-long-random-secret
CORS_ORIGIN=http://localhost:5173
OPENWEATHER_API_KEY=
NEWS_API_KEY=
AI_API_KEY=
AI_MODEL=
AI_BASE_URL=https://api.openai.com/v1
```

Install and start from the repo root:

```bash
npm run setup
npm start
```

### 2. Frontend

If you need local frontend-only development, copy `frontend/.env.example` to `frontend/.env` and set:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Then run:

```bash
cd frontend
npm run dev
```

## AWS Elastic Beanstalk

This repo is configured for the Elastic Beanstalk Node.js platform.

The production flow is:

1. EB runs `npm install` in the repo root.
2. Root `postinstall` installs backend and frontend dependencies.
3. Root `postinstall` builds `frontend/dist`.
4. `Procfile` starts the backend with `npm start`.
5. `backend/server.js` serves the API and the built frontend.

### What to deploy

Upload the repo root with these runtime files:

- `backend/`
- `frontend/`
- `scripts/`
- `package.json`
- `package-lock.json`
- `Procfile`

Do not upload local `node_modules` or any generated archives.

### Environment variables

Set these in Elastic Beanstalk under Environment properties:

```env
JWT_SECRET=replace-with-a-long-random-secret
CLOUDANT_URL=https://username:password@your-cloudant-host
CLOUDANT_USERS_DB=users
CLOUDANT_CONVERSATIONS_DB=conversations
AI_API_KEY=your-gemini-or-provider-key
AI_MODEL=gemini-2.5-flash
AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
CORS_ORIGIN=https://your-elastic-beanstalk-domain.elasticbeanstalk.com
OPENWEATHER_API_KEY=
NEWS_API_KEY=
```

Do not set `PORT` manually. Elastic Beanstalk provides it.

### Recommended EB settings

- Platform: `Node.js`
- Health check path: `/api/health`
- Use the root of the repository as the source bundle

### Deploy flow

1. Run `npm run check` locally.
2. Zip the repo root without `node_modules`, `.git`, or generated build output.
3. Upload the source bundle to Elastic Beanstalk.
4. Verify `/api/health` after deployment.

## Checks

```bash
cd frontend
npm run lint
npm run build

cd ../backend
npm run check
```

## Notes

- If `AI_API_KEY` and `AI_MODEL` are missing, the app still works in demo mode.
- Backend storage is configured for Cloudant via `CLOUDANT_URL`.
- Conversation history is stored in browser local storage, not in Cloudant.
