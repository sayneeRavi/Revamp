FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package*.json ./
# Prefer clean install if lockfile exists; fallback to install
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

# Copy source
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Runtime image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy app
COPY --from=build /app /app

EXPOSE 4000

# Default envs can be overridden at run time
ENV PORT=4000

CMD ["node", "src/index.js"]