import { WebTracerProvider, BatchSpanProcessor } from '@opentelemetry/sdk-trace-web'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions'
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request'

let initialized = false

export function initTracing(otlpEndpoint: string) {
  if (initialized) return
  initialized = true

  try {
    const exporter = new OTLPTraceExporter({ url: otlpEndpoint })

    const provider = new WebTracerProvider({
      resource: resourceFromAttributes({ [ATTR_SERVICE_NAME]: 'myreadings-ui' }),
      spanProcessors: [new BatchSpanProcessor(exporter)],
    })

    provider.register()

    const xhrInstrumentation = new XMLHttpRequestInstrumentation({
      propagateTraceHeaderCorsUrls: [/\/api\//],
      ignoreUrls: [/\/realms\//, /\/openid-connect\//],
      applyCustomAttributesOnSpan: (span, xhr) => {
        try {
          const url = new URL(xhr.responseURL || '', globalThis.location?.href)
          span.updateName(url.pathname)
          span.setAttribute('page.route', globalThis.location?.pathname || '/')
        } catch { /* keep default name */ }
      },
    })
    xhrInstrumentation.setTracerProvider(provider)
    xhrInstrumentation.enable()

    console.log('[OTel] Browser tracing initialized, exporting to', otlpEndpoint)
  } catch (e) {
    console.error('[OTel] Failed to initialize tracing:', e)
  }
}
