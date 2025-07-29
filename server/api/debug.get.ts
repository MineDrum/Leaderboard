export default defineEventHandler(async () => {
  const runtimeConfig = useRuntimeConfig()
  
  return {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    platform: process.platform,
    nodeVersion: process.version,
    nuxtConfig: {
      hub: {
        kv: true,
        workers: true
      }
    },
    runtimeConfig: {
      hub: runtimeConfig.hub,
      nitro: runtimeConfig.nitro
    },
    env: {
      NODE_ENV: process.env.NODE_ENV,
      NITRO_PRESET: process.env.NITRO_PRESET,
      HUB_PROJECT_ID: process.env.HUB_PROJECT_ID
    }
  }
}) 