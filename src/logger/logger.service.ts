import winston from 'winston'
import opentelemetry from '@opentelemetry/api'
import { Logger, SeverityNumber, logs } from '@opentelemetry/api-logs'
import { Request, Response } from 'express'
import { LoggerService as NestLoggerService, Injectable } from '@nestjs/common'

import { EnvService } from '@/env/env.service'

@Injectable()
export class LoggerService implements NestLoggerService {
  logger: Logger
  consoleLogger: winston.Logger
  level: 'info' | 'error' | 'debug' | 'fatal' | 'warn' = 'info'

  constructor(private envService: EnvService) {
    this.logger = logs.getLogger(
      envService.get('OTEL_SERVICE_NAME'),
      envService.get('OTEL_SERVICE_VERSION'),
    )
    this.level = envService.get('LOG_LEVEL') as
      | 'info'
      | 'error'
      | 'debug'
      | 'fatal'
      | 'warn'

    const transports = [new winston.transports.Console()]

    this.consoleLogger = winston.createLogger({
      level: this.level,
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
        winston.format((info) => {
          if (process.env.NODE_ENV !== 'test') {
            const span = opentelemetry.trace.getActiveSpan()

            if (span) {
              info.spanId = span.spanContext().spanId
              info.traceId = span.spanContext().traceId
            }
          }

          return info
        })(),
        winston.format.json(),
      ),
      transports,
    })
  }

  private logMessage(
    body: string | { req?: Request; res?: Response },
    severityNumber: SeverityNumber,
    severityText: string,
  ) {
    const message = this.buildMessage(body)

    this.consoleLogger[severityText.toLowerCase()](message)

    this.logger.emit({
      body: message,
      severityNumber,
      severityText,
    })
  }

  log(message: string) {
    this.logMessage(message, SeverityNumber.INFO, 'INFO')
  }

  private bodyIsExpressRequest(
    body: string | Request | Response,
  ): body is Request {
    return (body as Request).method !== undefined
  }

  private bodyIsExpressResponse(
    body: string | Request | Response,
  ): body is Response {
    return (body as Response).statusCode !== undefined
  }

  private buildMessage(body: string | { req?: Request; res?: Response }) {
    if (
      typeof body === 'object' &&
      body.req &&
      this.bodyIsExpressRequest(body.req)
    ) {
      return `${body.req.method} ${body.req.url}`
    } else if (
      typeof body === 'object' &&
      body.res &&
      this.bodyIsExpressResponse(body.res)
    ) {
      return `${body.res.req.method} ${body.res.req.url} ${body.res.statusCode}`
    } else if (typeof body === 'string') {
      return body
    } else {
      return ''
    }
  }

  info(body: string | { req?: Request; res?: Response }) {
    this.logMessage(body, SeverityNumber.INFO, 'INFO')
  }

  error(body: string | { req?: Request; res?: Response }) {
    this.logMessage(body, SeverityNumber.ERROR, 'ERROR')
  }

  debug(body: string | { req?: Request; res?: Response }) {
    this.logMessage(body, SeverityNumber.DEBUG, 'DEBUG')
  }

  fatal(body: string | { req?: Request; res?: Response }) {
    this.logMessage(body, SeverityNumber.FATAL, 'FATAL')
  }

  warn(body: string | { req?: Request; res?: Response }) {
    this.logMessage(body, SeverityNumber.WARN, 'WARN')
  }

  trace(message: string) {
    if (process.env.NODE_ENV !== 'test') {
      this.logger.emit({
        body: message,
        severityNumber: SeverityNumber.TRACE,
        severityText: 'TRACE',
      })
    }
  }
}
