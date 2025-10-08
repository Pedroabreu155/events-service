import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { trace, context as otContext } from '@opentelemetry/api'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

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

    // Pega o span ativo do OpenTelemetry
    const span = trace.getSpan(otContext.active())
    const traceId = span?.spanContext().traceId ?? 'no-trace'
    const spanId = span?.spanContext().spanId ?? 'no-span'

    // Log detalhado
    this.logger.error(
      `[traceId:${traceId} spanId:${spanId}] ${request.method} ${request.url} - Status: ${status} - Message: ${
        typeof message === 'string' ? message : JSON.stringify(message)
      }`,
    )

    response.status(status).json(message)
  }
}
