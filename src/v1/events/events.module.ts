import { Module } from '@nestjs/common'
import { PostEventController } from './post-event.controller'
import { EnvModule } from '../../env/env.module'

@Module({
  controllers: [PostEventController],
  imports: [EnvModule],
})
export class EventsModule {}
