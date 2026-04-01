import { Module, Global } from '@nestjs/common'
import { OpenTelemetryService } from './opentelemetry.service'
import { EnvModule } from '@/env/env.module'

@Global()
@Module({
  providers: [OpenTelemetryService],
  exports: [OpenTelemetryService],
  imports: [EnvModule],
})
export class OpenTelemetryModule {}
