import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import {
  trace,
  context as otelContext,
  SpanStatusCode,
} from '@opentelemetry/api'

@Injectable()
export class OtelRequestMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const tracer = trace.getTracer('http-tracer')

    const existingSpan = trace.getSpan(otelContext.active())
    if (existingSpan) {
      return next()
    }

    const span = tracer.startSpan(`HTTP ${req.method} ${req.path}`)
    span.setAttribute('http.method', req.method)
    span.setAttribute('http.url', req.originalUrl)
    span.setAttribute('http.route', req.route?.path || req.path)

    res.on('finish', () => {
      span.setAttribute('http.status_code', res.statusCode)
      if (res.statusCode >= 400) {
        span.setStatus({ code: SpanStatusCode.ERROR })
      }
      span.end()
    })

    otelContext.with(trace.setSpan(otelContext.active(), span), () => next())
  }
}
