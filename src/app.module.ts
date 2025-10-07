import { Module } from '@nestjs/common'
import { PrismaService } from './v1/prisma/prisma.service'
import { PostEventController } from './v1/controllers/post-event.controller'

@Module({
  controllers: [PostEventController],
  providers: [PrismaService],
})
export class AppModule {}
