FROM node:18-alpine

WORKDIR /app

# Install git and other dependencies
RUN apk add --no-cache git openssh-client

# Create repositories directory with correct permissions
RUN mkdir -p /git-storage && chmod 777 /git-storage

# Copy package files first for better caching
COPY package*.json ./

# Install @nestjs/cli globally and project dependencies
RUN npm install -g @nestjs/cli && \
    npm ci --force && \
    npm cache clean --force

# Copy source code
COPY . .

# Build the application with verbose output
RUN nest build && \
    ls -la dist/ && \
    test -f dist/main.js

EXPOSE 3001
EXPOSE 9465

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --spider http://localhost:9465/metrics || exit 1

CMD ["node", "dist/main.js"]