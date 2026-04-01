import { Module } from '@nestjs/common'

import { PostEventController } from './infra/http/post-event.controller'
import { ListEventsController } from './infra/http/list-events.controller'
import { EnvModule } from '@/env/env.module'
import { RabbitMQService } from '@/infra/rabbitmq/rabbitmq.service'
import { EventsConsumer } from './infra/rabbitmq/events.consumer'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { CreateAuditEventUseCase } from '@/application/use-cases/create-audit-event/create-audit-event.use-case'
import { ListAuditEventsUseCase } from '@/application/use-cases/list-audit-events/list-audit-events.use-case'
import { PersistAuditEventUseCase } from '@/application/use-cases/persist-audit-event/persist-audit-event.use-case'
import { PrismaAuditEventRepositoryAdapter } from '@/infra/database/prisma-audit-event-repository.adapter'
import { RabbitMQEventPublisherAdapter } from '@/infra/rabbitmq/rabbitmq-event-publisher.adapter'
import { AUDIT_EVENT_REPOSITORY_PORT } from '@/domain/audit-event/ports/audit-event-repository.port'
import { EVENT_PUBLISHER_PORT } from '@/domain/audit-event/ports/event-publisher.port'

@Module({
  controllers: [PostEventController, ListEventsController],
  imports: [EnvModule],
  providers: [
    PrismaService,
    RabbitMQService,
    EventsConsumer,
    CreateAuditEventUseCase,
    ListAuditEventsUseCase,
    PersistAuditEventUseCase,
    {
      provide: AUDIT_EVENT_REPOSITORY_PORT,
      useClass: PrismaAuditEventRepositoryAdapter,
    },
    {
      provide: EVENT_PUBLISHER_PORT,
      useClass: RabbitMQEventPublisherAdapter,
    },
  ],
})
export class EventsModule {}
