FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install -g @nestjs/cli && \
    npm ci --force && \
    npm cache clean --force

COPY . .

RUN nest build && \
    ls -la dist/ && \
    test -f dist/main.js

EXPOSE 3000
EXPOSE 9464

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --spider http://localhost:9464/metrics || exit 1

CMD ["node", "dist/main.js"]