import { describe, it, expect, vi } from 'vitest'
import { ListAuditEventsUseCase } from './list-audit-events.use-case'
import { AuditEventRepositoryPort } from '@/domain/audit-event/ports/audit-event-repository.port'
import { Severity, Result } from '@/domain/audit-event/audit-event.types'
import { AuditEvent } from '@/domain/audit-event/audit-event.entity'

describe('ListAuditEventsUseCase', () => {
  it('should list audit events with filters', async () => {
    const mockRepository: AuditEventRepositoryPort = {
      save: vi.fn(),
      findAll: vi.fn().mockResolvedValue({
        events: [
          AuditEvent.create({
            timestamp: new Date(),
            userId: 1,
            clientId: 1,
            eventType: 'LOGIN',
            sourceIp: '127.0.0.1',
            criticality: Severity.LOW,
            result: Result.SUCCESS,
          }),
        ],
        total: 1,
      }),
    }

    const useCase = new ListAuditEventsUseCase(mockRepository)

    const dto = {
      userId: 1,
      page: 1,
      limit: 10,
    }

    const result = await useCase.execute(dto)

    expect(mockRepository.findAll).toHaveBeenCalledWith({
      ...dto,
      startDate: undefined,
      endDate: undefined,
      clientId: undefined,
      userId: 1,
      page: 1,
      limit: 10,
    })
    expect(result.total).toBe(1)
    expect(result.events).toHaveLength(1)
  })

  it('should handle string conversions correctly', async () => {
    const mockRepository: AuditEventRepositoryPort = {
      save: vi.fn(),
      findAll: vi.fn().mockResolvedValue({ events: [], total: 0 }),
    }

    const useCase = new ListAuditEventsUseCase(mockRepository)

    const dto = {
      userId: '1' as any,
      clientId: '2' as any,
      page: '1' as any,
      limit: '20' as any,
      startDate: '2026-01-01T00:00:00Z' as any,
    }

    await useCase.execute(dto)

    expect(mockRepository.findAll).toHaveBeenCalledWith(expect.objectContaining({
      userId: 1,
      clientId: 2,
      page: 1,
      limit: 20,
      startDate: new Date('2026-01-01T00:00:00Z'),
    }))
  })
})
