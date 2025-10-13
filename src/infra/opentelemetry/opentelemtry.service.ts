import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs'
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-proto'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'

import { EnvService } from '@/env/env.service'
import { PrismaInstrumentation } from '@prisma/instrumentation'

@Injectable()
export class OpenTelemetryService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OpenTelemetryService.name)
  private sdk: NodeSDK

  constructor(private envService: EnvService) {
    const traceExporter = new OTLPTraceExporter({
      url: this.envService.get('OTEL_OTLP_TRACES_EXPORTER_URL'),
    })

    const metricExporter = new OTLPMetricExporter({
      url: this.envService.get('OTEL_OTLP_METRICS_EXPORTER_URL'),
    })

    const logExporter = new OTLPLogExporter({
      url: this.envService.get('OTEL_OTLP_LOGS_EXPORTER_URL'),
    })

    console.log(this.envService.get('OTEL_OTLP_LOGS_EXPORTER_URL'))

    this.sdk = new NodeSDK({
      resource: resourceFromAttributes({
        [ATTR_SERVICE_NAME]: this.envService.get('OTEL_SERVICE_NAME'),
        [ATTR_SERVICE_VERSION]: this.envService.get('OTEL_SERVICE_VERSION'),
      }),
      traceExporter,
      metricReader: new PeriodicExportingMetricReader({
        exporter: metricExporter,
        exportIntervalMillis: 1000,
      }),
      logRecordProcessor: new BatchLogRecordProcessor(logExporter),
      instrumentations: [
        getNodeAutoInstrumentations(),
        new PrismaInstrumentation(),
      ],
    })
  }

  async onModuleInit() {
    await this.sdk.start()
    this.logger.log('✅ OpenTelemetry SDK started')
  }

  async onModuleDestroy() {
    await this.sdk.shutdown()
    this.logger.log('🧹 OpenTelemetry SDK shut down')
  }
}
