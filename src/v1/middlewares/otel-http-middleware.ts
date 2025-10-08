import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import { trace } from '@opentelemetry/api'

@Injectable()
export class OtelHttpMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const tracer = trace.getTracer('http-tracer')

    const span = tracer.startSpan(`HTTP ${req.method} ${req.path}`)

    span.setAttribute('http.method', req.method)
    span.setAttribute('http.url', req.originalUrl)
    span.setAttribute('http.route', req.route?.path || req.path)

    if (req.query)
      span.setAttribute('http.query', JSON.stringify(req.query).slice(0, 1024))
    if (req.body)
      span.setAttribute('http.body', JSON.stringify(req.body).slice(0, 2048))

    if (req.headers['user-agent'])
      span.setAttribute('http.user_agent', req.headers['user-agent'])

    res.on('finish', () => {
      span.setAttribute('http.status_code', res.statusCode)
      if (res.statusCode >= 400) {
        span.setStatus({ code: 2 }) // Error
      }
      span.end()
    })

    next()
  }
}
