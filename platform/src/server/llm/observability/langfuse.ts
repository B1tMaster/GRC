import { Langfuse } from 'langfuse'

const isEnabled = Boolean(process.env.LANGFUSE_ENABLED)

let langfuseInstance: Langfuse

try {
  langfuseInstance = new Langfuse({
    publicKey: process.env.LANGFUSE_PUBLIC_KEY,
    secretKey: process.env.LANGFUSE_SECRET_KEY,
    baseUrl: process.env.LANGFUSE_HOST || 'https://cloud.langfuse.com',
    enabled: isEnabled,
    release: process.env.RAILWAY_GIT_COMMIT_SHA || process.env.npm_package_version || 'dev',
    requestTimeout: 10_000,
  })
} catch (error) {
  console.warn('[Langfuse] Initialization failed, tracing disabled:', error instanceof Error ? error.message : String(error))
  langfuseInstance = new Langfuse({ enabled: false })
}

export const langfuse = langfuseInstance

if (isEnabled) {
  const gracefulShutdown = async () => {
    try {
      await langfuse.shutdownAsync()
    } catch { /* best effort */ }
  }

  process.on('SIGTERM', gracefulShutdown)
  process.on('SIGINT', gracefulShutdown)
}
