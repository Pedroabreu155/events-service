import { AuditEvent } from '../audit-event.entity'

export const EVENT_PUBLISHER_PORT = Symbol('EVENT_PUBLISHER_PORT')

export interface EventPublisherPort {
  publish(event: AuditEvent): Promise<void>
}
