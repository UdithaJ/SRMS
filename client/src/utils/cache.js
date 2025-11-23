// Simple in-memory cache with TTL (Time To Live)
class Cache {
  constructor() {
    this.cache = new Map()
    this.timestamps = new Map()
  }

  set(key, value, ttl = 300000) { // default 5 minutes
    this.cache.set(key, value)
    this.timestamps.set(key, {
      created: Date.now(),
      ttl
    })
  }

  get(key) {
    if (!this.cache.has(key)) return null

    const timestamp = this.timestamps.get(key)
    const age = Date.now() - timestamp.created

    // Check if cache is expired
    if (age > timestamp.ttl) {
      this.delete(key)
      return null
    }

    return this.cache.get(key)
  }

  has(key) {
    return this.get(key) !== null
  }

  delete(key) {
    this.cache.delete(key)
    this.timestamps.delete(key)
  }

  clear() {
    this.cache.clear()
    this.timestamps.clear()
  }

  // Invalidate cache entries matching a pattern
  invalidatePattern(pattern) {
    const regex = new RegExp(pattern)
    const keysToDelete = []
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key)
      }
    }
    
    keysToDelete.forEach(key => this.delete(key))
  }
}

export const apiCache = new Cache()

// Helper to generate cache keys
export const generateCacheKey = (endpoint, params = {}) => {
  const paramString = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&')
  return paramString ? `${endpoint}?${paramString}` : endpoint
}
