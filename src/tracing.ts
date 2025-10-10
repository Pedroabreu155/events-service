import 'dotenv/config'

import { NodeSDK } from '@opentelemetry/sdk-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus'

export async function setupTracing() {
  const collectorUrl = process.env.OTEL_COLLECTOR_URL

  // Trace exporter
  const traceExporter = new OTLPTraceExporter({
    url: `${collectorUrl}/v1/traces`,
  })

  const prometheusExporter = new PrometheusExporter(
    { port: 9464, host: '0.0.0.0', startServer: true },
    () => {
      console.log('Prometheus scrape endpoint: http://localhost:9464/metrics')
    },
  )

  const sdk = new NodeSDK({
    instrumentations: [getNodeAutoInstrumentations()],
    traceExporter,
    metricReaders: prometheusExporter,
    serviceName: 'audit-service',
  })

  await sdk.start()
  console.log('[Tracing] OpenTelemetry started for service "audit-service"')

  process.on('beforeExit', async () => {
    await sdk.shutdown()
    console.log('[Tracing] OpenTelemetry SDK shutdown')
  })
}
