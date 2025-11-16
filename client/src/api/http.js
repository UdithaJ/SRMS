import axios from 'axios'

// Prefer env value when provided (Vite injects at build time)
const envBase = import.meta?.env?.VITE_API_BASE_URL

// In packaged Electron, we load via file:// — default to local server port
const defaultBase = 'http://127.0.0.1:3000'

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
