import { Global, Module } from '@nestjs/common'

import { LoggerService } from './logger.service'
import { EnvService } from '@/env/env.service'

@Global()
@Module({
  providers: [LoggerService, EnvService],
  exports: [LoggerService],
})
export class LoggerModule {}
