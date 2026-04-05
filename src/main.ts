import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { EnvService } from '@/env/env.service'
import { AllExceptionsFilter } from '@/filters/exceptions'
import { AppModule } from '@/app.module'
import { LoggerService } from '@/logger/logger.service'
import { RabbitMQService } from '@/infra/rabbitmq/rabbitmq.service'
import { RabbitMQInvalidEventNotifierAdapter } from '@/infra/rabbitmq/rabbitmq-invalid-event-notifier.adapter'

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		bufferLogs: true,
	})

	const logger = app.get(LoggerService)
	const rabbitMQService = app.get(RabbitMQService)
	const invalidEventNotifier = new RabbitMQInvalidEventNotifierAdapter(rabbitMQService)
	app.useLogger(logger)
	app.enableCors({
		origin: '*',
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'x-api-key'],
	})

	app.useGlobalFilters(new AllExceptionsFilter(logger, invalidEventNotifier))

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
