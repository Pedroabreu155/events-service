import { Result, Severity } from '@/domain/audit-event/audit-event.types'

export interface ListAuditEventsDto {
	startDate?: Date
	endDate?: Date
	result?: Result | string
	criticality?: Severity | string
	clientId?: number
	userId?: number
	eventType?: string
	page?: number
	limit?: number
}

export interface AuditEventResponse {
	id: number
	timestamp: Date
	userId: number
	clientId: number
	eventType: string
	sourceIp: string
	criticality: string
	result: string
	correlationId?: string
	entityId?: string
	details?: Record<string, any>
	createdAt: Date
}

export interface ListAuditEventsResponse {
	events: AuditEventResponse[]
	total: number
}
