import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(private readonly metricsService: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const end = this.metricsService.startTimer();

    res.on('finish', () => {
      const path = req.route ? req.route.path : req.path;
      this.metricsService.incrementRequestCount(
        req.method,
        path,
        res.statusCode,
      );
      end({ method: req.method, path, status_code: res.statusCode.toString() });
    });

    next();
  }
}
