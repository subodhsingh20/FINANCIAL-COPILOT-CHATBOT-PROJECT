# Elastic Beanstalk Deployment Guide

## What This Repo Does In Production

- Elastic Beanstalk installs dependencies from the project root.
- Root `postinstall` installs both `backend` and `frontend` dependencies.
- Root `postinstall` also builds the frontend into `frontend/dist`.
- The running process is started from the root `Procfile`.
- `backend/server.js` serves both the API and the built frontend.

## Elastic Beanstalk Requirements

1. Use the `Node.js` Elastic Beanstalk platform.
2. Choose a Node.js version compatible with this app.
   This repo is configured for `Node 20.x` or `Node 22.x`.
3. Deploy from the project root, not from only `backend` or only `frontend`.

## Important Files

- `Procfile`
  `web: npm start`
- `package.json`
  Includes:
  - `postinstall` to install/build subprojects
  - `start` to launch the backend server
- `backend/server.js`
  Uses `process.env.PORT`, which Elastic Beanstalk sets automatically.

## Environment Variables

Set these in Elastic Beanstalk under:
`Environment properties`

Required:

```env
JWT_SECRET=replace-with-a-long-random-secret
CLOUDANT_URL=https://username:password@your-cloudant-host
CLOUDANT_USERS_DB=users
CLOUDANT_CONVERSATIONS_DB=conversations
AI_API_KEY=your-gemini-or-provider-key
AI_MODEL=gemini-2.5-flash
AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
```

Recommended:

```env
CORS_ORIGIN=https://your-elastic-beanstalk-domain.eu-west-1.elasticbeanstalk.com
OPENWEATHER_API_KEY=
NEWS_API_KEY=
```

Notes:

- Do not set `PORT` manually in Elastic Beanstalk.
- For production on the same domain, leave `frontend` API base empty.
- `frontend/.env.example` is already configured for same-origin production usage.

## Deploy Steps

1. From the project root, make sure local checks pass:

```bash
npm run check
```

2. Create the deployable source bundle from the project root.

3. Upload the full root project to Elastic Beanstalk.

4. Elastic Beanstalk will:
   - run `npm install`
   - trigger root `postinstall`
   - build the frontend
   - start the app with the `Procfile`

## Recommended Elastic Beanstalk Setup

1. Create a `Web server environment`.
2. Use the default reverse proxy that Elastic Beanstalk provides.
3. Configure health check path as:

```text
/api/health
```

4. Add your environment properties before first launch.
5. After deployment, test:
   - `/api/health`
   - register
   - login
   - create chat
   - refresh conversation history

## What To Upload

Upload the repo root with:

- `backend/`
- `frontend/`
- `scripts/`
- `package.json`
- `package-lock.json`
- `Procfile`

Do not upload local `node_modules`.

## If Build Fails

Check Elastic Beanstalk logs for:

- missing env vars
- bad Cloudant credentials
- Node version mismatch
- frontend build failures during root `postinstall`

## Current Production Entry Point

Elastic Beanstalk starts:

```bash
npm start
```

That runs:

```bash
npm --prefix backend run start
```

And the backend serves the built frontend from:

```text
frontend/dist
```
