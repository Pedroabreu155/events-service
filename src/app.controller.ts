import { Controller, Get, HttpCode } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('health')
@Controller('/v1')
export class AppController {
  @Get('/health')
  @HttpCode(200)
  async health() {
    return {
      message: 'service running',
    }
  }
}
