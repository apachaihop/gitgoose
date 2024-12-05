import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import {
  requestCounterProvider,
  requestDurationProvider,
} from './metric.decorators';

@Module({
  imports: [
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
        config: {
          prefix: 'gitgoose_git_',
        },
      },
      path: '/metrics',
      defaultLabels: {
        app: 'gitgoose-git',
        env: process.env.NODE_ENV || 'development',
      },
    }),
  ],
  controllers: [MetricsController],
  providers: [MetricsService, requestCounterProvider, requestDurationProvider],
  exports: [MetricsService],
})
export class MetricsModule {}
