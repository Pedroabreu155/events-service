import { AuditEvent } from '../audit-event.entity'

export const AUDIT_EVENT_REPOSITORY_PORT = Symbol('AUDIT_EVENT_REPOSITORY_PORT')

export interface AuditEventRepositoryPort {
  save(event: AuditEvent): Promise<void>
}
