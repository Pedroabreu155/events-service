import { Controller, Get, HttpCode, Inject } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'

@ApiTags('health')
@Controller('/v1')
export class AppController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Get('/health')
  @HttpCode(200)
  async health() {
    this.logger.info('Health checked!')

    return {
      message: 'service running',
    }
  }
}
