import { Module } from '@nestjs/common'

import { PostEventController } from './post-event.controller'
import { EnvModule } from '@/env/env.module'
import { RabbitMQService } from '@/infra/rabbitmq/rabbitmq.service'
import { EventsConsumer } from './events.consumer'
import { PrismaService } from '@/v1/prisma/prisma.service'

@Module({
  controllers: [PostEventController],
  imports: [EnvModule],
  providers: [PrismaService, RabbitMQService, EventsConsumer],
})
export class EventsModule {}
