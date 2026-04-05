import { ApiProperty } from '@nestjs/swagger'

export class AuditEventResponseDto {
	@ApiProperty({ example: 123 })
	id!: number

	@ApiProperty({ example: '2026-01-01T14:00:00Z' })
	timestamp!: Date

	@ApiProperty({ example: 111 })
	userId!: number

	@ApiProperty({ example: 222 })
	clientId!: number

	@ApiProperty({ example: 'TEST_EVENT' })
	eventType!: string

	@ApiProperty({ example: '127.0.0.1' })
	sourceIp!: string

	@ApiProperty({ example: 'LOW', enum: ['HIGH', 'MEDIUM', 'LOW'] })
	criticality!: string

	@ApiProperty({ example: 'SUCCESS', enum: ['SUCCESS', 'FAILURE'] })
	result!: string

	@ApiProperty({ example: 'corr-abc123', required: false })
	correlationId?: string

	@ApiProperty({ example: 'entity-456', required: false })
	entityId?: string

	@ApiProperty({ example: { foo: 'bar' }, required: false, type: Object })
	details?: Record<string, any>

	@ApiProperty({ example: '2026-04-05T18:00:00Z' })
	createdAt!: Date
}

export class ListAuditEventsResponseDto {
	@ApiProperty({ example: 1 })
	total!: number

	@ApiProperty({ type: [AuditEventResponseDto] })
	events!: AuditEventResponseDto[]
}
