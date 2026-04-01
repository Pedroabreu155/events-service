import {
  Body,
  Controller,
  HttpCode,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common'

import opentelemetry, * as api from '@opentelemetry/api'

import { ZodValidationPipe } from '@/pipes/zod-validation-pipe'
import { eventPayloadSchema } from '@/domain/audit-event/audit-event.schema'
import { type EventPayload } from '@/domain/audit-event/audit-event.types'
import { ApiKeyGuard } from './guards/api-key.guard'
import { ApiBody, ApiSecurity, ApiTags } from '@nestjs/swagger'
import { EventPayloadDto } from './dtos/post-event.dto'
import { LoggerService } from '@/logger/logger.service'
import { EnvService } from '@/env/env.service'
import { CreateAuditEventUseCase } from '@/application/use-cases/create-audit-event/create-audit-event.use-case'

@UseGuards(ApiKeyGuard)
@ApiSecurity('x-api-key')
@ApiTags('audit')
@Controller('/v1/audit/events')
export class PostEventController {
  private tracer: api.Tracer
  private meter: api.Meter
  private context: api.ContextAPI

  constructor(
    private readonly logger: LoggerService,
    private readonly envService: EnvService,
    private readonly createAuditEventUseCase: CreateAuditEventUseCase,
  ) {
    this.tracer = opentelemetry.trace.getTracer(
      this.envService.get('OTEL_SERVICE_NAME'),
      this.envService.get('OTEL_SERVICE_VERSION'),
    )

    this.meter = opentelemetry.metrics.getMeter(
      this.envService.get('OTEL_SERVICE_NAME'),
      this.envService.get('OTEL_SERVICE_VERSION'),
    )

    this.context = opentelemetry.context
  }

  @ApiBody({ type: EventPayloadDto })
  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(eventPayloadSchema))
  async handle(@Body() payload: EventPayload) {
    await this.tracer.startActiveSpan(
      'PostEventController.handle',
      {},
      this.context.active(),
      async (span) => {
        const histogram = this.meter.createHistogram('event.process.duration', {
          description: 'Duration of audit event processing',
          unit: 'milliseconds',
          valueType: api.ValueType.INT,
        })

        const startTime = Date.now()

        try {
          await this.createAuditEventUseCase.execute(payload)

          span.setAttribute('event', JSON.stringify(payload))
          span.setStatus({ code: api.SpanStatusCode.OK })
        } catch (error) {
          span.setStatus({
            code: api.SpanStatusCode.ERROR,
            message: String(error),
          })

          this.logger.error(`Erro ao processar evento: ${error}`)

          throw error
        } finally {
          const endTime = Date.now()

          histogram.record(endTime - startTime, {
            route: '/v1/audit/events',
            method: 'POST',
          })

          span.end()
        }
      },
    )
  }
}
