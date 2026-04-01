import { z } from 'zod'
import { eventPayloadSchema } from './audit-event.schema'

export enum Severity {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum Result {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}

export type EventPayload = z.infer<typeof eventPayloadSchema>

export interface FailedEventPayload {
  originalPayload: any
  validationErrors: any
  failedAt: string
  traceId: string
}
