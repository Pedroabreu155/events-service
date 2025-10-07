import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { EnvService } from './env/env'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

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
