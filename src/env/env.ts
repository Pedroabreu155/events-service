import { z } from 'zod'

export const envSchema = z.object({
  DATABASE_URL: z.url(),
  PORT: z.coerce.number().optional().default(3333),
  API_KEY: z.string(),
  LOKI_URL: z.string(),
  REDIS_URL: z.string(),
  RABBITMQ_URL: z.string(),
  OTEL_COLLECTOR_URL: z.string(),
})

export type Env = z.infer<typeof envSchema>
