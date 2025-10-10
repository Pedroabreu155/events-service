import {
  Body,
  Controller,
  HttpCode,
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

@UseGuards(ApiKeyGuard)
@ApiTags('audit')
@Controller('/v1/audit/events')
export class PostEventController {
  @ApiBody({ type: EventPayloadDto })
  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(eventPayloadSchema))
  async handle(@Body() payload: EventPayload) {
    console.log(payload, 'PAYLOAD')
  }
}
