import { Module } from '@nestjs/common'
import { EnvService } from './env'

@Module({
  providers: [EnvService],
  exports: [EnvService],
})
export class EnvModule {}
