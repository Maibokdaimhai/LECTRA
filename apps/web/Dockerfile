# Compose web image: Vite assets + nginx. Root image serves the SPA via Express instead.
FROM node:24.22.1-bookworm-slim AS build
WORKDIR /app
RUN npm install --global npm@10.9.2
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY scripts/check-runtime.mjs scripts/check-runtime.mjs
RUN npm ci
COPY tsconfig.base.json ./
COPY apps/web ./apps/web
RUN npm run build --workspace @lectra/web

FROM nginx:1.28-alpine AS runtime
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
RUN sed -i 's@/var/run/nginx.pid@/tmp/nginx.pid@;s@/run/nginx.pid@/tmp/nginx.pid@;/^user[[:space:]]/d' /etc/nginx/nginx.conf && chown -R nginx:nginx /var/cache/nginx
EXPOSE 8080
USER nginx
ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]
