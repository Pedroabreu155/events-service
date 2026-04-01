import { Injectable, Inject } from '@nestjs/common'
import {
  AUDIT_EVENT_REPOSITORY_PORT,
  type AuditEventRepositoryPort,
} from '@/domain/audit-event/ports/audit-event-repository.port'
import { ListAuditEventsDto } from './list-audit-events.dto'

@Injectable()
export class ListAuditEventsUseCase {
  constructor(
    @Inject(AUDIT_EVENT_REPOSITORY_PORT)
    private readonly repository: AuditEventRepositoryPort,
  ) {}

  async execute(dto: ListAuditEventsDto) {
    return this.repository.findAll({
      ...dto,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      clientId: dto.clientId ? Number(dto.clientId) : undefined,
      userId: dto.userId ? Number(dto.userId) : undefined,
      page: dto.page ? Number(dto.page) : undefined,
      limit: dto.limit ? Number(dto.limit) : undefined,
    })
  }
}
