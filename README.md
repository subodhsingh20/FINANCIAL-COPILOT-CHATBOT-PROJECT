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
MONGO_URI=your-mongodb-uri
JWT_SECRET=your-long-random-secret
CORS_ORIGIN=http://localhost:5173
OPENWEATHER_API_KEY=
NEWS_API_KEY=
AI_API_KEY=
AI_MODEL=
AI_BASE_URL=https://api.openai.com/v1
```

Install and start:

```bash
cd backend
npm install
npm start
```

### 2. Frontend

Copy `frontend/.env.example` to `frontend/.env` if needed:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Install and run:

```bash
cd frontend
npm install
npm run dev
```

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
- The current frontend bundle is still fairly large, so code-splitting is a good next optimization.
- Conversation history is stored in browser local storage right now, not in MongoDB.
