import { Channel } from 'amqplib'

interface QueueNames {
  mainExchange: string
  mainQueue: string
  dlxExchange: string
  dlq: string
}

export async function setupRabbitMQ(channel: Channel, queues: QueueNames) {
  await channel.assertExchange(queues.mainExchange, 'direct', { durable: true })
  await channel.assertExchange(queues.dlxExchange, 'fanout', { durable: true })

  await channel.assertQueue(queues.dlq, { durable: true })
  await channel.bindQueue(queues.dlq, queues.dlxExchange, '')

  await channel.assertQueue(queues.mainQueue, {
    durable: true,
    deadLetterExchange: queues.dlxExchange,
  })

  await channel.bindQueue(
    queues.mainQueue,
    queues.mainExchange,
    queues.mainQueue,
  )

  console.log('✅ RabbitMQ setup completo para trouw_ms_audit_service')
}
