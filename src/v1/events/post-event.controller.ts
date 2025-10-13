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
import { eventPayloadSchema } from '@/v1/interfaces/schemas'
import { type EventPayload } from '@/v1/interfaces/types'
import { ApiKeyGuard } from '@/v1/auth/api-key.guard'
import { ApiBody, ApiTags } from '@nestjs/swagger'
import { EventPayloadDto } from '@/v1/interfaces/dto.docs'
import { LoggerService } from '@/logger/logger.service'
import { EnvService } from '@/env/env.service'

@UseGuards(ApiKeyGuard)
@ApiTags('audit')
@Controller('/v1/audit/events')
export class PostEventController {
  private tracer: api.Tracer
  private meter: api.Meter
  private context: api.ContextAPI

  constructor(
    private readonly logger: LoggerService,
    private readonly envService: EnvService,
  ) {
    this.tracer = opentelemetry.trace.getTracer(
      envService.get('OTEL_SERVICE_NAME'),
      envService.get('OTEL_SERVICE_VERSION'),
    )

    this.meter = opentelemetry.metrics.getMeter(
      envService.get('OTEL_SERVICE_NAME'),
      envService.get('OTEL_SERVICE_VERSION'),
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
          this.logger.info(JSON.stringify(payload))

          span.setAttribute('event', JSON.stringify(payload))
          span.setStatus({ code: api.SpanStatusCode.OK })
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
