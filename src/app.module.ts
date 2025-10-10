import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { WinstonModule } from 'nest-winston'
import winston from 'winston'

import { PrismaService } from './v1/prisma/prisma.service'
import { envSchema } from './env/env'
import { EnvModule } from './env/env.module'
import { EventsModule } from './v1/events/events.module'
import { AppController } from './app.controller'
import { OtelHttpMiddleware } from './v1/middlewares/otel-http-middleware'

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => {
        const parsed = envSchema.safeParse(env)

        if (!parsed.success) {
          console.error('❌ Erro de validação nas variáveis de ambiente:')
          console.error(parsed.error.issues)
          process.exit(1) // força o app a parar
        }
        return parsed.data
      },
      isGlobal: true,
    }),
    EnvModule,
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.printf(({ level, message, timestamp }) => {
              return `${timestamp} [${level}]: ${message}`
            }),
          ),
        }),
      ],
    }),
    EventsModule,
  ],
  providers: [PrismaService],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(OtelHttpMiddleware).forRoutes('*')
  }
}
