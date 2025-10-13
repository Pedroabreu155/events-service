import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { Request, Response } from 'express'
import {
  trace,
  context as otelcontext,
  SpanStatusCode,
} from '@opentelemetry/api'

import { LoggerService } from '@/logger/logger.service'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR

    const message =
      exception instanceof HttpException ? exception.getResponse() : exception

    const span = trace.getSpan(otelcontext.active())
    const traceId = span?.spanContext().traceId ?? 'no-trace'
    const spanId = span?.spanContext().spanId ?? 'no-span'

    const logMessage = `[traceId:${traceId} spanId:${spanId}] ${request.method} ${request.url} - Status: ${status} - Message: ${
      typeof message === 'string' ? message : JSON.stringify(message)
    }`

    this.logger.error(logMessage)

    if (span) {
      span.recordException(
        exception instanceof Error ? exception : new Error(logMessage),
      )
      span.setStatus({ code: SpanStatusCode.ERROR, message: logMessage })
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      traceId,
      message,
    })
  }
}
