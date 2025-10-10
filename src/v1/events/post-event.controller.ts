import {
  Body,
  Controller,
  HttpCode,
  Inject,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common'

import { ZodValidationPipe } from '../pipes/zod-validation-pipe'
import { eventPayloadSchema } from '../interfaces/schemas'
import { type EventPayload } from '../interfaces/types'
import { ApiKeyGuard } from '../auth/api-key.guard'
import { ApiBody, ApiTags } from '@nestjs/swagger'
import { EventPayloadDto } from '../interfaces/dto.docs'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'

@UseGuards(ApiKeyGuard)
@ApiTags('audit')
@Controller('/v1/audit/events')
export class PostEventController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @ApiBody({ type: EventPayloadDto })
  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(eventPayloadSchema))
  async handle(@Body() payload: EventPayload) {
    this.logger.info('PAYLOAD', payload)
  }
}
