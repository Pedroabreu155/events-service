import { z } from 'zod'

export const envSchema = z.object({
  DATABASE_URL: z.url(),
  PORT: z.coerce.number().optional().default(3333),
  API_KEY: z.string(),
  REDIS_URL: z.url(),
  RABBITMQ_URL: z.url(),
  OTEL_SERVICE_NAME: z.string({
    error: 'Variável de ambiente OTEL_SERVICE_NAME é obrigatória',
  }),
  OTEL_SERVICE_VERSION: z.string({
    error: 'Variável de ambiente OTEL_SERVICE_VERSION é obrigatória',
  }),
  OTEL_OTLP_TRACES_EXPORTER_URL: z.url({
    error:
      'Variável de ambiente OTEL_OTLP_TRACES_EXPORTER_URL deve ser uma URL válida',
  }),
  OTEL_OTLP_LOGS_EXPORTER_URL: z.url({
    error:
      'Variável de ambiente OTEL_OTLP_LOGS_EXPORTER_URL deve ser uma URL válida',
  }),
  OTEL_OTLP_METRICS_EXPORTER_URL: z.url({
    error:
      'Variável de ambiente OTEL_OTLP_METRICS_EXPORTER_URL deve ser uma URL válida',
  }),
  LOG_LEVEL: z
    .enum(['info', 'error', 'debug', 'fatal', 'warn'], {
      error: 'LOG_LEVEL é necessário!',
    })
    .default('info'),
})
