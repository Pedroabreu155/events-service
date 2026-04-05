import { Severity, Result } from './audit-event.types'

export interface AuditEventProps {
	id?: number
	timestamp: string | Date
	userId: number
	clientId: number
	eventType: string
	sourceIp: string
	criticality: Severity | keyof typeof Severity
	result: Result | keyof typeof Result
	correlationId?: string
	entityId?: string
	details?: Record<string, any>
	createdAt?: Date
}

export type CreateAuditEventProps = Omit<AuditEventProps, 'id'>

export class AuditEvent {
	public readonly id?: number
	public readonly timestamp: Date
	public readonly userId: number
	public readonly clientId: number
	public readonly eventType: string
	public readonly sourceIp: string
	public readonly criticality: Severity
	public readonly result: Result
	public readonly correlationId?: string
	public readonly entityId?: string
	public readonly details?: Record<string, any>
	public readonly createdAt: Date

	private constructor(props: Omit<AuditEvent, 'createdAt'> & { createdAt?: Date }) {
		this.id = props.id
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
		return AuditEvent.build({
			...props,
			timestamp: new Date(props.timestamp),
			criticality: AuditEvent.normalizeCriticality(props.criticality),
			result: AuditEvent.normalizeResult(props.result),
			createdAt: props.createdAt || new Date(),
		})
	}

	static fromPersistence(props: AuditEventProps): AuditEvent {
		return AuditEvent.build({
			...props,
			timestamp: new Date(props.timestamp),
			criticality: AuditEvent.normalizeCriticality(props.criticality),
			result: AuditEvent.normalizeResult(props.result),
			createdAt: props.createdAt || new Date(),
		})
	}

	private static normalizeCriticality(value: Severity | keyof typeof Severity): Severity {
		if (Object.values(Severity).includes(value as Severity)) {
			return value as Severity
		}
		return Severity[value as keyof typeof Severity]
	}

	private static normalizeResult(value: Result | keyof typeof Result): Result {
		if (Object.values(Result).includes(value as Result)) {
			return value as Result
		}
		return Result[value as keyof typeof Result]
	}

	private static build(props: Omit<AuditEvent, 'createdAt'> & { createdAt?: Date }): AuditEvent {
		return new AuditEvent(props)
	}
}
