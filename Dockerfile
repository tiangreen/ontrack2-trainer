# Build stage runs on the builder's native platform; the output is static files.
FROM --platform=$BUILDPLATFORM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Hash routing: nginx's default config (serve index.html, no SPA fallback) is enough.
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
