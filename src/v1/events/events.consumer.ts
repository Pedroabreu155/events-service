import { ConsumeMessage } from 'amqplib'

import { Injectable, OnModuleInit } from '@nestjs/common'
import { RabbitMQService } from '@/infra/rabbitmq/rabbitmq.service'
import { PrismaService } from '@/v1/prisma/prisma.service'
import { EnvService } from '@/env/env.service'
import { EventPayload } from '@/v1/interfaces/types'
import { Severity, Result } from '@/v1/interfaces/enums'
import { LoggerService } from '@/logger/logger.service'

@Injectable()
export class EventsConsumer implements OnModuleInit {
  constructor(
    private readonly rabbitmq: RabbitMQService,
    private readonly prisma: PrismaService,
    private readonly env: EnvService,
    private readonly logger: LoggerService,
  ) {}

  async onModuleInit() {
    const queue = this.env.get('RABBITMQ_MAIN_QUEUE')

    await this.rabbitmq.consume(queue, this.handleMessage.bind(this))
    await this.rabbitmq.consumeDlq(this.handleDlqMessage.bind(this))
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async handleMessage(msg: any) {
    const payload = JSON.parse(msg.content.toString()) as EventPayload

    try {
      await this.prisma.eventoAuditoria.create({
        data: {
          ts_transaction: new Date(payload.timestamp),
          id_user: payload.userId,
          id_company: payload.clientId,
          tp_event: payload.eventType,
          ip_host: payload.sourceIp,
          id_severity: Severity[payload.criticality],
          id_result: Result[payload.result],
          id_correlation: payload.correlationId,
          id_entity: payload.entityId,
          js_detail: payload.details,
          ts_created_at: new Date(),
          created_by: 'trouw-ms-audit-service',
          updated_by: 'trouw-ms-audit-service',
        },
      })
    } catch (dbError) {
      this.logger.error(
        `🚨 Falha crítica ao salvar evento no banco: ${dbError}`,
      )
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async handleDlqMessage(msg: ConsumeMessage, failContext: any) {
    const content = msg.content.toString()

    this.logger.warn(
      `💀 Processando mensagem da DLQ. Motivo: ${failContext.reason}`,
    )

    // Tenta salvar no banco de dados para análise posterior (Recomendado)
    try {
      // SUGESTÃO: Criar uma tabela 'EventoAuditoriaFalha' no Prisma
      // Se não tiver a tabela, apague este bloco e use apenas o Logger abaixo
      /*
        await this.prisma.eventoAuditoriaFalha.create({
            data: {
                payload_original: content,
                motivo_erro: failContext.reason, // ex: rejected
                fila_origem: failContext.originalQueue,
                stack_erro: JSON.stringify(failContext), // Metadados do x-death
                ts_data_erro: new Date(),
                resolvido: false
            }
        })
        */

      this.logger.error(`Evento com erro: ${JSON.stringify(content)}`)
    } catch (dbError) {
      // Se falhar ao salvar o erro no banco, logamos no console para não perder a informação
      this.logger.error(`🚨 Falha crítica ao salvar DLQ no banco: ${dbError}`)
    }
  }
}
