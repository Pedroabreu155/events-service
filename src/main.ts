import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'

import { AppModule } from './app.module'
import { EnvService } from './env/env.service'
import { setupTracing } from './tracing'
import { AllExceptionsFilter } from './v1/filters/exceptions'

async function bootstrap() {
  await setupTracing()

  const app = await NestFactory.create(AppModule, {
    logger: false,
  })

  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER)
  app.useLogger(logger)

  app.useGlobalFilters(
    new AllExceptionsFilter(app.get(WINSTON_MODULE_NEST_PROVIDER)),
  )

  const config = new DocumentBuilder()
    .setTitle('Audit Service API')
    .setDescription('API para registro de eventos e auditorias')
    .setVersion('1.0')
    .addTag('audit')
    .addTag('health')
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'x-api-key')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('/docs', app, document)

  const envService = app.get(EnvService)
  const port = envService.get('PORT')

  await app.listen(port)
}
bootstrap()
