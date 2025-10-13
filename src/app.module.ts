import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { PrismaService } from '@/v1/prisma/prisma.service'
import { envSchema } from '@/env/env'
import { EnvModule } from '@/env/env.module'
import { EventsModule } from '@/v1/events/events.module'
import { AppController } from '@/app.controller'
import { LoggerModule } from '@/logger/logger.module'
import { OpenTelemetryModule } from '@/infra/opentelemetry/opentelemetry.module'

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
    LoggerModule,
    OpenTelemetryModule,
    EventsModule,
  ],
  providers: [PrismaService],
  controllers: [AppController],
})
export class AppModule {}
