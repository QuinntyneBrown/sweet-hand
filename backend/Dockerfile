# syntax=docker/dockerfile:1.7
FROM node:22-bookworm-slim AS dependencies
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production PORT=4300
WORKDIR /app/backend
COPY --from=dependencies /app/backend/node_modules ./node_modules
COPY --chown=node:node backend/package.json backend/tsconfig.json ./
COPY --chown=node:node backend/src ./src
COPY --chown=node:node frontend/projects/api/src/lib/models /app/frontend/projects/api/src/lib/models
USER node
EXPOSE 4300
CMD ["npm", "start"]
