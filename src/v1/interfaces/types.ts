import z from 'zod'
import { eventPayloadSchema } from './schemas'

export type EventPayload = z.infer<typeof eventPayloadSchema>
