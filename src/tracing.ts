import { NodeSDK } from '@opentelemetry/sdk-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc'

export async function setupTracing() {
  const url = process.env.OTEL_COLLECTOR_URL

  const traceExporter = new OTLPTraceExporter({
    url,
  })

  const sdk = new NodeSDK({
    traceExporter,
    instrumentations: [getNodeAutoInstrumentations()],
    serviceName: 'audit-service',
  })

  sdk.start()
  console.log(`[Tracing] OpenTelemetry started for service`)

  process.on('beforeExit', async () => {
    await sdk.shutdown()
  })
}
