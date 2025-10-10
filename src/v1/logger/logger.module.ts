import { Module } from '@nestjs/common'
import { WinstonModule } from 'nest-winston'
import * as winston from 'winston'
import LokiTransport from 'winston-loki'
import { trace, context as otContext } from '@opentelemetry/api'

import { EnvModule } from '@/env/env.module'
import { EnvService } from '@/env/env.service'

@Module({
  imports: [
    EnvModule,
    WinstonModule.forRootAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: (env: EnvService) => ({
        transports: [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.colorize(),
              winston.format.printf(({ level, message, timestamp }) => {
                const span = trace.getSpan(otContext.active())
                const traceId = span?.spanContext().traceId ?? 'no-trace'
                const spanId = span?.spanContext().spanId ?? 'no-span'
                return `[${timestamp}] ${level} [traceId:${traceId} spanId:${spanId}] ${message}`
              }),
            ),
          }),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          new (LokiTransport as any)({
            host: env.get('LOKI_URL'),
            labels: {
              service: 'audit-service',
              env: process.env.NODE_ENV ?? 'dev',
            },
            json: true,
            batching: true,
            interval: 5000,
          }),
        ],
      }),
    }),
  ],
  exports: [WinstonModule],
})
export class LoggerModule {}
