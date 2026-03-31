import { Severity, Result } from './audit-event.types'

export interface CreateAuditEventProps {
  timestamp: string | Date
  userId: number
  clientId: number
  eventType: string
  sourceIp: string
  criticality: Severity | keyof typeof Severity
  result: Result | keyof typeof Result
  correlationId?: string
  entityId?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details?: Record<string, any>
}

export class AuditEvent {
  public readonly timestamp: Date
  public readonly userId: number
  public readonly clientId: number
  public readonly eventType: string
  public readonly sourceIp: string
  public readonly criticality: Severity
  public readonly result: Result
  public readonly correlationId?: string
  public readonly entityId?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public readonly details?: Record<string, any>
  public readonly createdAt: Date

  private constructor(
    props: Omit<AuditEvent, 'createdAt'> & { createdAt?: Date },
  ) {
    this.timestamp = props.timestamp
    this.userId = props.userId
    this.clientId = props.clientId
    this.eventType = props.eventType
    this.sourceIp = props.sourceIp
    this.criticality = props.criticality
    this.result = props.result
    this.correlationId = props.correlationId
    this.entityId = props.entityId
    this.details = props.details
    this.createdAt = props.createdAt || new Date()
  }

  static create(props: CreateAuditEventProps): AuditEvent {
    let criticalityEnum: Severity
    if (Object.values(Severity).includes(props.criticality as Severity)) {
      criticalityEnum = props.criticality as Severity
    } else {
      criticalityEnum = Severity[props.criticality as keyof typeof Severity]
    }

    let resultEnum: Result
    if (Object.values(Result).includes(props.result as Result)) {
      resultEnum = props.result as Result
    } else {
      resultEnum = Result[props.result as keyof typeof Result]
    }

    return new AuditEvent({
      ...props,
      timestamp: new Date(props.timestamp),
      criticality: criticalityEnum,
      result: resultEnum,
      createdAt: new Date(),
    })
  }
}
