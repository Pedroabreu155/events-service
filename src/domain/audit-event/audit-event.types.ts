export enum Severity {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum Result {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}

export interface FailedEventPayload {
  originalPayload: any
  validationErrors: any
  failedAt: string
  traceId: string
}
