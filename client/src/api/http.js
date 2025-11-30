import axios from 'axios'
import { apiCache, generateCacheKey } from '@/utils/cache'

// Prefer env value when provided (Vite injects at build time)
const envBase = import.meta.env.VITE_API_BASE_URL
const envPort = import.meta.env.VITE_API_PORT
console.error('API PORT:', envPort);
// Use port from env if available, otherwise default to 3000
const defaultPort = envPort || '3000'
const defaultBase = `http://127.0.0.1:${defaultPort}`

// Normalize and pick the base URL once
const baseURL = (typeof envBase === 'string' && envBase.trim().length > 0)
  ? envBase.trim().replace(/\/$/, '')
  : defaultBase

export const http = axios.create({
  baseURL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export function getApiUrl(path = '') {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${baseURL}${p}`
}

// Request interceptor with caching for GET requests
http.interceptors.request.use(
  (config) => {
    // Add JWT token from localStorage
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Check cache for GET requests with useCache flag
    if (config.method === 'get' && config.useCache !== false) {
      const cacheKey = generateCacheKey(config.url, config.params)
      const cachedData = apiCache.get(cacheKey)
      
      if (cachedData) {
        // Return cached response
        config.adapter = () => {
          return Promise.resolve({
            data: cachedData,
            status: 200,
            statusText: 'OK (cached)',
            headers: config.headers,
            config,
            request: {}
          })
        }
      }
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to cache successful GET responses
http.interceptors.response.use(
  (response) => {
    // Cache successful GET responses
    if (response.config.method === 'get' && response.config.useCache !== false) {
      const cacheKey = generateCacheKey(response.config.url, response.config.params)
      const ttl = response.config.cacheTTL || 300000 // Default 5 minutes
      apiCache.set(cacheKey, response.data, ttl)
    }

    return response
  },
  (error) => Promise.reject(error)
)

// Helper to invalidate cache
export const invalidateCache = (pattern) => {
  if (pattern) {
    apiCache.invalidatePattern(pattern)
  } else {
    apiCache.clear()
  }
}
