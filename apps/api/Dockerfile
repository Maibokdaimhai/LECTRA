# Compose API/setup image; build context MUST be the repository root.
FROM node:24.22.1-bookworm-slim AS dependencies
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN npm install --global npm@10.9.2
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY scripts/check-runtime.mjs scripts/check-runtime.mjs
RUN npm ci

FROM dependencies AS build
COPY tsconfig*.json prisma.config.ts ./
COPY prisma prisma
COPY apps/api apps/api
COPY apps/web apps/web
COPY scripts scripts
RUN npm run db:generate && npm run build --workspace @lectra/api

FROM node:24.22.1-bookworm-slim AS runtime
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN npm install --global npm@10.9.2
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/package.json /app/package-lock.json /app/prisma.config.ts /app/tsconfig.base.json ./
COPY --from=build --chown=node:node /app/apps/api ./apps/api
COPY --from=build --chown=node:node /app/apps/web/package.json ./apps/web/package.json
COPY --from=build --chown=node:node /app/prisma ./prisma
COPY --from=build --chown=node:node /app/scripts ./scripts
RUN chmod +x apps/api/docker-entrypoint.sh
ENV NODE_ENV=production PORT=3001
EXPOSE 3001
USER node
ENTRYPOINT ["/app/apps/api/docker-entrypoint.sh"]
CMD ["node", "apps/api/dist/server.js"]
