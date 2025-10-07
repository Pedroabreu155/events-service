import { Controller, Get, HttpCode } from '@nestjs/common'

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
