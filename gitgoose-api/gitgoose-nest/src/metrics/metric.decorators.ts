import {
  makeCounterProvider,
  makeHistogramProvider,
  makeGaugeProvider,
} from '@willsoto/nestjs-prometheus';

export const requestCounterProvider = makeCounterProvider({
  name: 'http_request_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status_code'],
});

export const requestDurationProvider = makeHistogramProvider({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'path', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5],
});
export const gitOperationsCounter = makeCounterProvider({
  name: 'git_operations_total',
  help: 'Total number of Git operations',
  labelNames: ['operation', 'status'],
});

export const activeUsersGauge = makeGaugeProvider({
  name: 'active_users',
  help: 'Number of currently active users',
});

export const repositorySizeGauge = makeGaugeProvider({
  name: 'repository_size_bytes',
  help: 'Size of repositories in bytes',
  labelNames: ['repo_id'],
});
