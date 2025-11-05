// src/infra/rabbitmq/consumers/audit.consumer.ts
import { Injectable, OnModuleInit } from '@nestjs/common'
import { LoggerService } from '@/logger/logger.service'
import { RabbitMQService } from '@/infra/rabbitmq/rabbitmq.service'
import { PrismaService } from '@/v1/prisma/prisma.service'
import { EnvService } from '@/env/env.service'
import { EventPayload } from '@/v1/interfaces/types'

@Injectable()
export class EventsConsumer implements OnModuleInit {
  constructor(
    private readonly rabbitmq: RabbitMQService,
    private readonly logger: LoggerService,
    private readonly prisma: PrismaService,
    private readonly env: EnvService,
  ) {}

  async onModuleInit() {
    const queue = this.env.get('RABBITMQ_MAIN_QUEUE')

    await this.rabbitmq.consume(queue, this.handleMessage.bind(this))
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async handleMessage(msg: any) {
    const payload = JSON.parse(msg.content.toString()) as EventPayload

    await this.prisma.eventoAuditoria.create({
      data: {
        eaud_timestamp: new Date(payload.timestamp),
        eaud_user_pess_oras_codigo: payload.userId,
        eaud_client_pess_oras_codigo: payload.clientId,
        eaud_tipo_evento: payload.eventType,
        eaud_ip_origem: payload.sourceIp,
        eaud_criticidade: payload.criticality,
        eaud_resultado: payload.result,
        eaud_id_correlacao: payload.correlationId,
        eaud_id_entidade: payload.entityId,
        eaud_detalhes_json: payload.details,
        eaud_data_cadastro: new Date(),
        eaud_usuario_adicionou: 'trouw-ms-audit-service',
        eaud_usuario_alterou: 'trouw-ms-audit-service',
      },
    })
  }
}
