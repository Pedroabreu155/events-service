import { Injectable } from '@nestjs/common'
import { AuditEventRepositoryPort } from '@/domain/audit-event/ports/audit-event-repository.port'
import { AuditEvent } from '@/domain/audit-event/audit-event.entity'
import { PrismaService } from './prisma/prisma.service'
import { Severity as PrismaSeverity, Result as PrismaResult } from 'generated/prisma'

@Injectable()
export class PrismaAuditEventRepositoryAdapter implements AuditEventRepositoryPort {
	constructor(private readonly prisma: PrismaService) {}

	async save(event: AuditEvent): Promise<void> {
		await this.prisma.eventoAuditoria.create({
			data: {
				ts_transaction: event.timestamp,
				id_user: event.userId,
				id_company: event.clientId,
				tp_event: event.eventType,
				ip_host: event.sourceIp,
				id_severity: event.criticality as unknown as PrismaSeverity,
				id_result: event.result as unknown as PrismaResult,
				id_correlation: event.correlationId,
				id_entity: event.entityId,
				js_detail: event.details as any,
				ts_created_at: event.createdAt,
				created_by: 'events-service',
				updated_by: 'events-service',
			},
		})
	}
}
