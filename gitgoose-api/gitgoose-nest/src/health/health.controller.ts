import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    @InjectMetric('health_check_total')
    private healthCheckCounter: Counter<string>,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    this.healthCheckCounter.inc();
    return this.health.check([]);
  }
}
