import { Redis } from 'ioredis'
import { gunzipAsync, gzipAsync } from '@/server/lib/utils'

type Key = string
type AnyValue = string | number | object
type Value = AnyValue | null

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined
}

export function getRedisClient(redisUrl: string): Redis {
  // Skip Redis initialization during build
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'build') {
    return null as any // Type assertion for build phase
  }

  // Return existing connection if available
  if (globalForRedis.redis) {
    return globalForRedis.redis
  }

  // Create new connection only in runtime
  if (typeof window === 'undefined') {
    // Server-side only
    globalForRedis.redis = new Redis(redisUrl, {
      retryStrategy(times) {
        return Math.min(times * 50, 2000)
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      reconnectOnError: err => {
        const targetError = 'READONLY'
        return err.message.includes(targetError)
      },
      showFriendlyErrorStack: process.env.NODE_ENV !== 'production',
    })

    // Add error handling
    globalForRedis.redis.on('error', error => {
      console.error('Redis connection error:', error)
    })

    globalForRedis.redis.on('connect', () => {
      console.log('Successfully connected to Redis')
    })
  }

  return globalForRedis.redis!
}

const projectPrefix = 'secure-path'

export class RedisCache {
  private redis: Redis
  readonly redisUrl: string

  constructor() {
    this.redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379'
    this.redis = getRedisClient(this.redisUrl)
  }

  private shouldStringify(value: Value): boolean {
    return typeof value === 'object' && value !== null
  }

  private handleStringify(value: AnyValue): string {
    if (this.shouldStringify(value)) {
      return JSON.stringify(value)
    }

    return String(value)
  }

  instance() {
    return this.redis
  }

  mappings = {
    research: (key: AnyValue) => `${projectPrefix}:research:${this.handleStringify(key)}`,
    generalLlm: (key: AnyValue) => `${projectPrefix}:general-llm:${this.handleStringify(key)}`,
  }

  async set(key: Key, value: Value, ttl = 3600): Promise<void> {
    if (!value) return

    const handledValue = this.handleStringify(value)
    const compressedData = await gzipAsync(handledValue)
    await this.redis.set(key, compressedData)
    await this.redis.expire(key, ttl)
  }

  async get(key: Key): Promise<Value | null> {
    const compressedData = await this.redis.getBuffer(key)

    if (!compressedData) {
      return null
    }

    const decompressedData = await gunzipAsync(compressedData)
    const stringData = decompressedData.toString()

    try {
      return JSON.parse(stringData) as Value
    } catch (error) {
      return stringData
    }
  }
}
