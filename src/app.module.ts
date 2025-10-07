import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { PrismaService } from './v1/prisma/prisma.service'
import { PostEventController } from './v1/controllers/post-event.controller'
import { envSchema } from './env/env'
import { EnvModule } from './env/env.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    EnvModule,
  ],
  controllers: [PostEventController],
  providers: [PrismaService],
})
export class AppModule {}
