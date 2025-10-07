import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { PrismaService } from './v1/prisma/prisma.service'
import { envSchema } from './env/env'
import { EnvModule } from './env/env.module'
import { EventsModule } from './v1/events/events.module'
import { AppController } from './app.controller'

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    EnvModule,
    EventsModule,
  ],
  providers: [PrismaService],
  controllers: [AppController],
})
export class AppModule {}
