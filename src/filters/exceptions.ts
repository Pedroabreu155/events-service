import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common'
import { Request, Response } from 'express'
import {
  trace,
  context as otelContext,
  SpanStatusCode,
} from '@opentelemetry/api'

import { LoggerService } from '@/logger/logger.service'
import { RabbitMQService } from '@/infra/rabbitmq/rabbitmq.service'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly logger: LoggerService,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR

    const message =
      exception instanceof HttpException ? exception.getResponse() : exception

    const span = trace.getSpan(otelContext.active())
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

    if (
      exception instanceof BadRequestException &&
      request.url.includes('/v1/audit/events')
    ) {
      const invalidPayload = request.body

      try {
        this.logger.warn(
          `[traceId:${traceId}] Payload de auditoria inválido detectado. Enviando para DLQ...`,
        )

        await this.rabbitMQService.sendToDLQQueue({
          originalPayload: invalidPayload,
          validationErrors: message,
          failedAt: new Date().toISOString(),
          traceId,
        })
      } catch (dlqError) {
        this.logger.error(
          `[traceId:${traceId}] CRÍTICO: Falha ao tentar enviar mensagem inválida para a DLQ: ${dlqError}`,
        )
      }
    }

    response.status(status).json(message)
  }
}
