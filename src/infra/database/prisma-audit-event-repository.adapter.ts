import { Injectable } from '@nestjs/common'
import { AuditEventRepositoryPort } from '@/domain/audit-event/ports/audit-event-repository.port'
import { AuditEvent } from '@/domain/audit-event/audit-event.entity'
import { PrismaService } from './prisma/prisma.service'
import { Severity as PrismaSeverity, Result as PrismaResult, Prisma } from 'generated/prisma'

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
	async findAll(filters: {
		startDate?: Date
		endDate?: Date
		result?: string
		criticality?: string
		clientId?: number
		userId?: number
		eventType?: string
		page?: number
		limit?: number
	}): Promise<{ events: AuditEvent[]; total: number }> {
		const { page = 1, limit = 10 } = filters
		const where: Prisma.EventoAuditoriaWhereInput = {}

		if (filters.startDate || filters.endDate) {
			where.ts_transaction = {
				gte: filters.startDate,
				lte: filters.endDate,
			}
		}

		if (filters.result) {
			where.id_result = filters.result as PrismaResult
		}

		if (filters.criticality) {
			where.id_severity = filters.criticality as PrismaSeverity
		}

		if (filters.clientId) {
			where.id_company = filters.clientId
		}

		if (filters.userId) {
			where.id_user = filters.userId
		}

		if (filters.eventType) {
			where.tp_event = {
				contains: filters.eventType,
				mode: 'insensitive',
			}
		}

		const [total, results] = await Promise.all([
			this.prisma.eventoAuditoria.count({ where }),
			this.prisma.eventoAuditoria.findMany({
				where,
				take: limit,
				skip: (page - 1) * limit,
				orderBy: { ts_transaction: 'desc' },
			}),
		])

		const events = results.map((row) =>
			AuditEvent.create({
				timestamp: row.ts_transaction,
				userId: row.id_user,
				clientId: row.id_company,
				eventType: row.tp_event,
				sourceIp: row.ip_host,
				criticality: row.id_severity as any,
				result: row.id_result as any,
				correlationId: row.id_correlation || undefined,
				entityId: row.id_entity || undefined,
				details: (row.js_detail as any) || undefined,
				createdAt: row.ts_created_at,
			}),
		)

		return { events, total }
	}
}
