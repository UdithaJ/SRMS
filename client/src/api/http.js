import axios from 'axios'

// Prefer env value when provided (Vite injects at build time)
const envBase = import.meta?.env?.VITE_API_BASE_URL

// In packaged Electron, we load via file:// — default to local server port
const defaultBase = 'http://127.0.0.1:8090'

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

// Add request interceptor to include JWT token
http.interceptors.request.use(
  async (config) => {
    // Get token from localStorage (it's synced from Electron store on loadUser)
    let token = null
    try {
      token = localStorage.getItem('authToken')
    } catch {}
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export function getApiUrl(path = '') {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${baseURL}${p}`
}
