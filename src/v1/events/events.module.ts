import { Module } from '@nestjs/common'

import { PostEventController } from './post-event.controller'
import { EnvModule } from '@/env/env.module'
import { RabbitMQService } from '@/infra/rabbitmq/rabbitmq.service'

@Module({
  controllers: [PostEventController],
  imports: [EnvModule],
  providers: [RabbitMQService],
})
export class EventsModule {}
