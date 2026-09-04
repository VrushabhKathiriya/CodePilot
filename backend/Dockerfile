# -----------------------------------------------------------------------------
# CodePilot Backend � Dockerfile
# Node version: 24 (matches local v24.11.1)
# Base: node:24-slim (Debian slim  avoids Alpine musl issues with bcrypt/Prisma)
# Port: 8000
# -----------------------------------------------------------------------------

FROM node:24-slim

# Install system dependencies:
#   openssl      — required by Prisma v6 engine binaries
#   libatomic1   — required by bcrypt native addon (node-gyp build)
#   python3, make, g++ — required by node-gyp to compile native addons (bcrypt)
RUN apt-get update -y && \
    apt-get install -y openssl libatomic1 python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files first (layer caching  only re-installs if deps change)
COPY package*.json ./

# Copy Prisma schema so `prisma generate` can reference it
COPY prisma ./prisma/

# Install all dependencies (postinstall auto-runs `prisma generate`)
RUN npm ci

# Re-run prisma generate explicitly after schema is available
RUN npx prisma generate

# Copy the rest of the source code
COPY . .

# Expose the backend port
EXPOSE 8000

# Health check � lets Docker (and Compose) know when the service is ready
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://localhost:8000/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# Production start: runs pending DB migrations then starts the Express server
CMD ["npm", "start"]
