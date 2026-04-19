import { useState, useCallback } from 'react'
import api from '../services/api'

export function useAuth() {
  const [user, setUser]       = useState(() => {
    const stored = localStorage.getItem('ecoquest_user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const login = useCallback(async (username, password) => {
    setLoading(true); setError(null)
    try {
      // TODO: replace with real AWS Cognito call
      const res = await api.post('/auth/login', { username, password })
      localStorage.setItem('ecoquest_token', res.data.token)
      localStorage.setItem('ecoquest_user',  JSON.stringify(res.data.user))
      setUser(res.data.user)
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }, [])

  const signup = useCallback(async (payload) => {
    setLoading(true); setError(null)
    try {
      const res = await api.post('/register', payload)
      localStorage.setItem('ecoquest_token', res.data.token || 'mock_token') // Backend doesn't return token yet
      localStorage.setItem('ecoquest_user',  JSON.stringify({ id: res.data.userId, name: payload.name || payload.username, ...payload }))
      setUser({ id: res.data.userId, name: payload.name || payload.username, ...payload })
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('ecoquest_token')
    localStorage.removeItem('ecoquest_user')
    setUser(null)
    window.location.href = '/onboarding'
  }, [])

  return { user, loading, error, login, signup, logout }
}
