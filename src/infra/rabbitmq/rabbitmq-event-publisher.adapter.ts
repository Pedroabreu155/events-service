import { Injectable } from '@nestjs/common'
import { EventPublisherPort } from '@/domain/audit-event/ports/event-publisher.port'
import { AuditEvent } from '@/domain/audit-event/audit-event.entity'
import { RabbitMQService } from './rabbitmq.service'

@Injectable()
export class RabbitMQEventPublisherAdapter implements EventPublisherPort {
  constructor(private readonly rabbitmq: RabbitMQService) {}

  async publish(event: AuditEvent): Promise<void> {
    // Convert entity back to payload expected by the queue
    const payload = {
      timestamp: event.timestamp.toISOString(),
      userId: event.userId,
      clientId: event.clientId,
      eventType: event.eventType,
      sourceIp: event.sourceIp,
      criticality: event.criticality,
      result: event.result,
      correlationId: event.correlationId,
      entityId: event.entityId,
      details: event.details,
    }

    await this.rabbitmq.sendToAuditQueue(payload)
  }
}
