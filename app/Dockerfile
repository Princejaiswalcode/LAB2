# ---------- Stage 1: build / install dependencies ----------
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev && npm cache clean --force
COPY server.js ./

# ---------- Stage 2: minimal runtime image ----------
FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app /app
USER node
EXPOSE 3000
CMD ["node", "server.js"]
