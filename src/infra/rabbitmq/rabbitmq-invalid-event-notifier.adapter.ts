import { Injectable } from '@nestjs/common'
import { InvalidEventNotifierPort } from '@/domain/audit-event/ports/invalid-event-notifier.port'
import { FailedEventPayload } from '@/domain/audit-event/audit-event.types'
import { RabbitMQService } from './rabbitmq.service'

@Injectable()
export class RabbitMQInvalidEventNotifierAdapter implements InvalidEventNotifierPort {
  constructor(private readonly rabbitmq: RabbitMQService) {}

  async notifyInvalidEvent(payload: FailedEventPayload): Promise<void> {
    await this.rabbitmq.sendToDLQQueue(payload)
  }
}
