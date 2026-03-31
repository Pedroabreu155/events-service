import { Injectable, Inject, Logger } from '@nestjs/common'
import { CreateAuditEventDto } from '../create-audit-event/create-audit-event.dto'
import { AuditEvent } from '@/domain/audit-event/audit-event.entity'
import {
  AUDIT_EVENT_REPOSITORY_PORT,
  type AuditEventRepositoryPort,
} from '@/domain/audit-event/ports/audit-event-repository.port'
import { LoggerService } from '@/logger/logger.service'

@Injectable()
export class PersistAuditEventUseCase {
  constructor(
    @Inject(AUDIT_EVENT_REPOSITORY_PORT)
    private readonly repository: AuditEventRepositoryPort,
    private readonly logger: LoggerService,
  ) {}

  async execute(dto: CreateAuditEventDto): Promise<void> {
    try {
      const event = AuditEvent.create(dto)
      await this.repository.save(event)
    } catch (error) {
      this.logger.error(`🚨 Falha crítica ao salvar evento: ${error}`)
      throw error // Re-throw to be handled and NACKed by consumer
    }
  }
}
