# Adapted from the Lab 5 root image: npm workspaces, compiled API + built SPA.
# Build from the repository root. No runtime secret is a build argument.
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
RUN npm run build

FROM node:24.22.1-bookworm-slim AS runtime
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN npm install --global npm@10.9.2
# Retain installed CLI/tsx dependencies for explicit migration/seed jobs from this image.
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/package.json /app/package-lock.json /app/prisma.config.ts /app/tsconfig.base.json ./
COPY --from=build --chown=node:node /app/apps/api ./apps/api
COPY --from=build --chown=node:node /app/apps/web/package.json ./apps/web/package.json
COPY --from=build --chown=node:node /app/apps/web/dist ./apps/web/dist
COPY --from=build --chown=node:node /app/prisma ./prisma
COPY --from=build --chown=node:node /app/scripts ./scripts
RUN chmod +x apps/api/docker-entrypoint.sh
ENV NODE_ENV=production PORT=3001
EXPOSE 3001
USER node
ENTRYPOINT ["/app/apps/api/docker-entrypoint.sh"]
CMD ["node", "apps/api/dist/server.js"]
