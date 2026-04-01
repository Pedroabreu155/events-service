import { AuditEvent } from '../audit-event.entity'

export const AUDIT_EVENT_REPOSITORY_PORT = Symbol('AUDIT_EVENT_REPOSITORY_PORT')

export interface AuditEventRepositoryPort {
	save(event: AuditEvent): Promise<void>
	findAll(filters: {
		startDate?: Date
		endDate?: Date
		result?: string
		criticality?: string
		clientId?: number
		userId?: number
		eventType?: string
		page?: number
		limit?: number
	}): Promise<{ events: AuditEvent[]; total: number }>
}
