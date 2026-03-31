import { describe, it, expect, vi } from 'vitest'
import { CreateAuditEventUseCase } from './create-audit-event.use-case'
import { EventPublisherPort } from '@/domain/audit-event/ports/event-publisher.port'
import { Severity, Result } from '@/domain/audit-event/audit-event.types'
import { AuditEvent } from '@/domain/audit-event/audit-event.entity'

describe('CreateAuditEventUseCase', () => {
  it('should create an audit event and publish it', async () => {
    const mockPublisher: EventPublisherPort = {
      publish: vi.fn(),
    }

    const useCase = new CreateAuditEventUseCase(mockPublisher)

    const dto = {
      timestamp: new Date().toISOString(),
      userId: 1,
      clientId: 1,
      eventType: 'TEST_EVENT',
      sourceIp: '127.0.0.1',
      criticality: Severity.MEDIUM,
      result: Result.SUCCESS,
    }

    await useCase.execute(dto)

    expect(mockPublisher.publish).toHaveBeenCalledOnce()
    
    // Verificando os dados passados para a porta
    const publishedEvent = (mockPublisher.publish as any).mock.calls[0][0]
    expect(publishedEvent).toBeInstanceOf(AuditEvent)
    expect(publishedEvent.userId).toBe(1)
    expect(publishedEvent.eventType).toBe('TEST_EVENT')
  })
})
