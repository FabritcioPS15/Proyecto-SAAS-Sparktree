# Dockerfile for Sparktree SaaS Backend
# Updated to Node 22 LTS for compatibility with project requirements

FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache iproute2 curl && \
    # Deshabilitar IPv6 completamente en el kernel
    echo "net.ipv6.conf.all.disable_ipv6 = 1" > /etc/sysctl.d/99-ipv6-disable.conf && \
    echo "net.ipv6.conf.default.disable_ipv6 = 1" >> /etc/sysctl.d/99-ipv6-disable.conf && \
    echo "net.ipv6.conf.lo.disable_ipv6 = 1" >> /etc/sysctl.d/99-ipv6-disable.conf && \
    # Forzar preferencia IPv4 en getaddrinfo
    echo "precedence ::ffff:0:0/96  100" > /etc/gai.conf && \
    echo "label ::ffff:0:0/96  1" >> /etc/gai.conf

# Copy package files first for better caching
COPY package*.json ./

# Install ALL dependencies (including devDependencies for TypeScript compilation)
# Note: Using 'npm install' instead of 'npm ci' for development flexibility
# If you have a package-lock.json and want strict installs, use: npm ci
RUN npm install
RUN npm install bullmq @supabase/supabase-js ioredis

# Copy source code
COPY . .

RUN echo '#!/bin/sh' > /entrypoint.sh && \
    echo 'sysctl -w net.ipv6.conf.all.disable_ipv6=1 2>/dev/null || true' >> /entrypoint.sh && \
    echo 'sysctl -w net.ipv6.conf.default.disable_ipv6=1 2>/dev/null || true' >> /entrypoint.sh && \
    echo 'exec "$@"' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh
# Build TypeScript (if build script exists)
# If build fails, the app will still work with ts-node in development
RUN npm run build 2>/dev/null || echo "⚠️ Build script not found or failed, continuing with development mode"

# Create ephemeral directory for temporary auth state (RNF-05)
# This directory is not mounted as a volume, ensuring containers are stateless
RUN mkdir -p /tmp/auth_state && \
    chmod 777 /tmp/auth_state

# Set environment variables for ephemeral auth storage
ENV AUTH_STATE_PATH=/tmp/auth_state

# Expose port
EXPOSE 3000

# Health check (adjusted timeout for slower startup)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

ENTRYPOINT ["/entrypoint.sh"]
# Start application
CMD ["npm", "run", "dev"]