import { Injectable } from '@nestjs/common';
import { Counter, Histogram } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';

@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric('http_request_total')
    private readonly requestCounter: Counter<string>,
    @InjectMetric('http_request_duration_seconds')
    private readonly requestDuration: Histogram<string>,
  ) {}

  incrementRequestCount(method: string, path: string, statusCode: number) {
    this.requestCounter.inc({
      method,
      path,
      status_code: statusCode.toString(),
    });
  }

  startTimer() {
    return this.requestDuration.startTimer();
  }
}
