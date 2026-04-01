import { z } from 'zod'

export const eventPayloadSchema = z.object({
  timestamp: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'timestamp deve estar no formato ISO 8601',
  }),
  userId: z.number('userId é origatório'),
  clientId: z.number('clientId é obrigatório'),
  eventType: z.string().nonempty('eventType é obrigatório'),
  sourceIp: z.string().nonempty('sourceIp é obrigatório'),
  criticality: z.enum(['HIGH', 'MEDIUM', 'LOW'], 'criticality inválido'),
  result: z.enum(['SUCCESS', 'FAILURE'], 'result inválido'),
  correlationId: z.string().optional(),
  entityId: z.string().optional(),
  details: z.record(z.string(), z.any()).optional(),
})

export const listAuditEventsSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  result: z.enum(['SUCCESS', 'FAILURE']).optional(),
  criticality: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  clientId: z.coerce.number().optional(),
  userId: z.coerce.number().optional(),
  eventType: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
})
