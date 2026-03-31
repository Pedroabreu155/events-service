import { Injectable, OnModuleInit, OnModuleDestroy, ServiceUnavailableException } from '@nestjs/common'

import amqp, { Connection, Channel, ConsumeMessage } from 'amqplib'

import { EnvService } from '@/env/env.service'
import { LoggerService } from '@/logger/logger.service'
import { setupRabbitMQ } from './setup'

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
	private connection!: Connection
	private channel!: Channel
	private channelReady = false

	private readonly mainExchange = 'trouw_ms_audit_service_exchange'
	private readonly dlxExchange = 'trouw_ms_audit_service_dlx_exchange'

	constructor(
		private readonly envService: EnvService,
		private readonly logger: LoggerService
	) {}

	async onModuleInit() {
		const connectionOptions = {
			protocol: 'amqp',
			hostname: this.envService.get('RABBITMQ_HOST'),
			port: parseInt(this.envService.get('RABBITMQ_PORT') ?? '5672'),
			username: this.envService.get('RABBITMQ_USER'),
			password: this.envService.get('RABBITMQ_PASS'),
			vhost: this.envService.get('RABBITMQ_VHOST'),
		}

		this.connection = await amqp.connect(connectionOptions)
		this.channel = await this.connection.createChannel()

		this.channel.on('return', msg => {
			this.logger.warn(`⚠️ Mensagem não roteada: ${msg.content.toString()} — exchange=${msg.fields.exchange} routingKey=${msg.fields.routingKey}`)
		})

		await setupRabbitMQ(this.channel, {
			dlq: this.envService.get('RABBITMQ_DLQ_QUEUE'),
			dlxExchange: this.envService.get('RABBITMQ_DLX_EXCHANGE'),
			mainExchange: this.envService.get('RABBITMQ_MAIN_EXCHANGE'),
			mainQueue: this.envService.get('RABBITMQ_MAIN_QUEUE'),
		})

		this.channelReady = true
		this.logger.info('✅ RabbitMQ connected and queues configured')
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async sendToAuditQueue(message: any) {
		try {
			const payload = Buffer.from(JSON.stringify(message))

			await this.channel.publish(this.mainExchange, 'trouw_ms_audit_service_queue', payload, {
				persistent: true,
				mandatory: true,
			})

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (err: any) {
			this.logger.error(err)
			throw new ServiceUnavailableException('RabbitMQ unavailable')
		}
	}

	async sendToDLQQueue(message: any) {
		try {
			const payload = Buffer.from(JSON.stringify(message))

			await this.channel.publish(this.dlxExchange, 'trouw_ms_audit_service_dlq', payload, {
				persistent: true,
				mandatory: true,
			})
		} catch (err: any) {
			this.logger.error(err)
			throw new ServiceUnavailableException('RabbitMQ unavailable')
		}
	}

	private async waitForChannel() {
		let retries = 0
		while (!this.channelReady && retries < 20) {
			await new Promise(r => setTimeout(r, 250))
			retries++
		}
		if (!this.channelReady) {
			throw new ServiceUnavailableException('RabbitMQ channel not initialized')
		}
	}

	async consume(queue: string, onMessage: (msg: ConsumeMessage) => Promise<void>) {
		await this.waitForChannel()

		await this.channel.consume(queue, async msg => {
			if (!msg) return

			try {
				await onMessage(msg)
				this.channel.ack(msg)
			} catch (error) {
				this.logger.error(`❌ Erro ao processar mensagem: ${error}`)
				this.channel.nack(msg, false, false)
			}
		})

		this.logger.info(`📥 Consumindo mensagens da fila: ${queue}`)
	}

	async consumeDlq(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		onMessage: (msg: ConsumeMessage, failContext: any) => Promise<void>
	) {
		await this.waitForChannel()
		const dlqQueue = this.envService.get('RABBITMQ_DLQ_QUEUE')

		if (!dlqQueue) {
			this.logger.warn('⚠️ DLQ Queue name not found in env. DLQ Consumer skipped.')
			return
		}

		await this.channel.consume(dlqQueue, async msg => {
			if (!msg) return

			try {
				// Extrair metadados de erro (x-death headers)
				const failContext = this.parseXDeathHeader(msg)

				await onMessage(msg, failContext)

				// Sempre ACK na DLQ para evitar travar a fila com mensagens impossíveis de processar
				this.channel.ack(msg)
			} catch (error) {
				// Erro CRÍTICO: Falhamos até em processar o erro.
				// Logamos e damos ACK para limpar a DLQ.
				this.logger.error(`🚨 CRITICAL: Falha ao processar mensagem da DLQ: ${error}`)
				this.channel.ack(msg)
			}
		})

		this.logger.info(`💀 Consumindo DLQ: ${dlqQueue}`)
	}

	private parseXDeathHeader(msg: ConsumeMessage) {
		const headers = msg.properties.headers || {}
		const xDeath = headers['x-death']

		if (!xDeath || !Array.isArray(xDeath) || xDeath.length === 0) {
			return { reason: 'unknown', originalQueue: 'unknown', count: 0 }
		}

		const recentFailure = xDeath[0]

		return {
			reason: recentFailure.reason,
			originalQueue: recentFailure.queue,
			time: recentFailure.time,
			count: recentFailure.count,
			exchange: recentFailure.exchange,
			routingKeys: recentFailure['routing-keys'],
		}
	}

	async onModuleDestroy() {
		await this.channel.close()
		await this.connection.close()
	}
}
