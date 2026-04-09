FROM node:18

WORKDIR /app

COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/
COPY backend ./backend
COPY frontend ./frontend
COPY scripts ./scripts

RUN npm install --prefix backend \
  && npm install --prefix frontend \
  && npm run build --prefix frontend

ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
