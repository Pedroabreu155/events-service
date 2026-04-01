import {
  Controller,
  Get,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common'
import { ApiQuery, ApiSecurity, ApiTags } from '@nestjs/swagger'
import { ZodValidationPipe } from '@/pipes/zod-validation-pipe'
import { listAuditEventsSchema } from '@/domain/audit-event/audit-event.schema'
import { type ListAuditEventsDto } from '@/application/use-cases/list-audit-events/list-audit-events.dto'
import { ListAuditEventsUseCase } from '@/application/use-cases/list-audit-events/list-audit-events.use-case'
import { ApiKeyGuard } from './guards/api-key.guard'

@UseGuards(ApiKeyGuard)
@ApiSecurity('x-api-key')
@ApiTags('audit')
@Controller('/v1/audit/events')
export class ListEventsController {
  constructor(
    private readonly listAuditEventsUseCase: ListAuditEventsUseCase,
  ) {}

  @Get()
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'result', required: false, enum: ['SUCCESS', 'FAILURE'] })
  @ApiQuery({ name: 'criticality', required: false, enum: ['HIGH', 'MEDIUM', 'LOW'] })
  @ApiQuery({ name: 'clientId', required: false, type: Number })
  @ApiQuery({ name: 'userId', required: false, type: Number })
  @ApiQuery({ name: 'eventType', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @UsePipes(new ZodValidationPipe(listAuditEventsSchema))
  async handle(@Query() query: ListAuditEventsDto) {
    return this.listAuditEventsUseCase.execute(query)
  }
}
