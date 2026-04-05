import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PersistAuditEventUseCase } from './persist-audit-event.use-case'
import { AuditEventRepositoryPort } from '@/domain/audit-event/ports/audit-event-repository.port'
import { LoggerService } from '@/logger/logger.service'
import { Severity, Result } from '@/domain/audit-event/audit-event.types'
import { AuditEvent } from '@/domain/audit-event/audit-event.entity'

describe('PersistAuditEventUseCase', () => {
	let mockRepository: AuditEventRepositoryPort
	let mockLogger: LoggerService
	let useCase: PersistAuditEventUseCase

	beforeEach(() => {
		mockRepository = {
			save: vi.fn(),
			findAll: vi.fn(),
		} as unknown as AuditEventRepositoryPort

		mockLogger = {
			log: vi.fn(),
			error: vi.fn(),
			warn: vi.fn(),
			debug: vi.fn(),
			verbose: vi.fn(),
			info: vi.fn(),
		} as unknown as LoggerService

		useCase = new PersistAuditEventUseCase(mockRepository, mockLogger)
	})

	it('should create and save an audit event', async () => {
		const dto = {
			timestamp: new Date().toISOString(),
			userId: 2,
			clientId: 3,
			eventType: 'PERSIST_EVENT',
			sourceIp: '192.168.0.1',
			criticality: Severity.HIGH,
			result: Result.FAILURE,
		}

		await useCase.execute(dto)

		expect(mockRepository.save).toHaveBeenCalledOnce()
		const savedEvent = (mockRepository.save as any).mock.calls[0][0]
		expect(savedEvent).toBeInstanceOf(AuditEvent)
		expect(savedEvent.userId).toBe(2)
	})

	it('should log and rethrow when saving fails', async () => {
		const error = new Error('Database connection failed')
		mockRepository.save = vi.fn().mockRejectedValueOnce(error)

		const dto = {
			timestamp: new Date().toISOString(),
			userId: 2,
			clientId: 3,
			eventType: 'PERSIST_EVENT',
			sourceIp: '192.168.0.1',
			criticality: Severity.HIGH,
			result: Result.FAILURE,
		}

		await expect(useCase.execute(dto)).rejects.toThrow('Database connection failed')
		expect(mockLogger.error).toHaveBeenCalledOnce()
	})
})
