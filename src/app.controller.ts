import { Controller, Get, HttpCode } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { LoggerService } from '@/logger/logger.service'

@ApiTags('health')
@Controller('/v1')
export class AppController {
  constructor(private readonly logger: LoggerService) {}

  @Get('/health')
  @HttpCode(200)
  async health() {
    this.logger.info('Health checked!')

    return {
      message: 'service running',
    }
  }
}
