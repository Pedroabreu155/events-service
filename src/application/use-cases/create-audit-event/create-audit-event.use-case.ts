import { Injectable, Inject } from '@nestjs/common'
import { CreateAuditEventDto } from './create-audit-event.dto'
import { AuditEvent } from '@/domain/audit-event/audit-event.entity'
import {
  EVENT_PUBLISHER_PORT,
  type EventPublisherPort,
} from '@/domain/audit-event/ports/event-publisher.port'

@Injectable()
export class CreateAuditEventUseCase {
  constructor(
    @Inject(EVENT_PUBLISHER_PORT)
    private readonly publisher: EventPublisherPort,
  ) {}

  async execute(dto: CreateAuditEventDto): Promise<void> {
    const event = AuditEvent.create(dto)
    await this.publisher.publish(event)
  }
}
