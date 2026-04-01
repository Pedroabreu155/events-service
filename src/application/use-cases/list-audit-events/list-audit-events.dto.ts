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
