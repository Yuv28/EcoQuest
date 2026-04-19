import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('ecoquest_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Global error handler
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ecoquest_token')
      window.location.href = '/onboarding'
    }
    return Promise.reject(err)
  }
)

export default api
