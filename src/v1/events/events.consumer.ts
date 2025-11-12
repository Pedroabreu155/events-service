// src/infra/rabbitmq/consumers/audit.consumer.ts
import { Injectable, OnModuleInit } from '@nestjs/common'
import { RabbitMQService } from '@/infra/rabbitmq/rabbitmq.service'
import { PrismaService } from '@/v1/prisma/prisma.service'
import { EnvService } from '@/env/env.service'
import { EventPayload } from '@/v1/interfaces/types'
import { Criticidade, Resultado } from '@/v1/interfaces/enums'

@Injectable()
export class EventsConsumer implements OnModuleInit {
  constructor(
    private readonly rabbitmq: RabbitMQService,
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
        ts_data_ocorreu: new Date(payload.timestamp),
        id_usuario: payload.userId,
        id_cliente: payload.clientId,
        tipo_evento: payload.eventType,
        ip_origem: payload.sourceIp,
        st_criticidade: Criticidade[payload.criticality],
        st_resultado: Resultado[payload.result],
        id_correlacao: payload.correlationId,
        id_entidade: payload.entityId,
        detalhes_json: payload.details,
        ts_data_cadastro: new Date(),
        usuario_adicionou: 'trouw-ms-audit-service',
        usuario_alterou: 'trouw-ms-audit-service',
      },
    })
  }
}
