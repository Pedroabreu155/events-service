import { z } from 'zod'

export const eventPayloadSchema = z.object({
  timestamp: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'timestamp deve estar no formato ISO 8601',
  }),
  userId: z.number('userId é origatório'),
  clientId: z.number('clientId é oobrigatório'),
  eventType: z.string().nonempty('eventType é obrigatório'),
  sourceIp: z.string().nonempty('sourceIp é obrigatório'),
  criticality: z.enum(['HIGH', 'MEDIUM', 'LOW'], 'criticality inválido'),
  result: z.enum(['SUCCESS', 'FAILURE'], 'result inválido'),
  correlationId: z.string().optional(),
  entityId: z.string().optional(),
  details: z.record(z.string(), z.any()).optional(),
})
