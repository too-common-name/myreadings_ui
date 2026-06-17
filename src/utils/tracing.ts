/**
 * Lightweight W3C Trace Context propagation for browser → backend correlation.
 * Generates a traceparent header per request so Quarkus OTel continues the trace.
 * Format: {version}-{trace-id}-{parent-id}-{trace-flags}
 */

function randomHex(bytes: number): string {
  const arr = new Uint8Array(bytes)
  crypto.getRandomValues(arr)
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('')
}

export function generateTraceparent(): string {
  const traceId = randomHex(16)
  const parentId = randomHex(8)
  return `00-${traceId}-${parentId}-01`
}
