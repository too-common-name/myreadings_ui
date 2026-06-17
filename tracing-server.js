const { NodeSDK } = require('@opentelemetry/sdk-node')
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node')
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc')

const collectorEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://myreadings-collector:4317'

const sdk = new NodeSDK({
  serviceName: process.env.OTEL_SERVICE_NAME || 'myreadings-ui',
  traceExporter: new OTLPTraceExporter({ url: collectorEndpoint }),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false },
      '@opentelemetry/instrumentation-dns': { enabled: false },
      '@opentelemetry/instrumentation-express': { enabled: false },
      '@opentelemetry/instrumentation-router': { enabled: false },
      '@opentelemetry/instrumentation-net': { enabled: false },
    }),
  ],
})

sdk.start()
