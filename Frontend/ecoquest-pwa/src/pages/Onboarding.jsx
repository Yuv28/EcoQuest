import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Leaf, ArrowRight } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function Onboarding() {
  const [mode, setMode]       = useState('welcome') // welcome | login | signup
  const [username, setUsername] = useState('') // Changed from email to username for login
  const [password, setPassword] = useState('')
  const [name, setName]       = useState('')
  const { login, signup, loading, error } = useAuth()
  const navigate = useNavigate()

  // DEV SHORTCUT: skip auth during hackathon building
  const devSkip = () => {
    localStorage.setItem('ecoquest_token', 'dev_token')
    localStorage.setItem('ecoquest_user', JSON.stringify({
      id: 'dev_user', name: 'EcoQuester', xp: 1240, level: 4
    }))
    navigate('/')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    await login(username, password) // Changed from email to username
    navigate('/')
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    await signup({ username: name, interests: [] }) // Backend expects username and interests
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6"
         style={{ background: 'radial-gradient(ellipse at top, #1e3a1e 0%, #0d1a0d 60%)' }}>

      <AnimatePresence mode="wait">
        {mode === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-sm text-center"
          >
            {/* Logo */}
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="text-7xl mb-6"
            >
              🐾
            </motion.div>

            <h1 className="font-display text-4xl font-bold text-forest-300 mb-2">EcoQuest</h1>
            <p className="font-body text-forest-500 text-sm mb-10">
              Discover wildlife. Go green. Earn your mark.
            </p>

            <div className="flex flex-col gap-3">
              <button onClick={() => setMode('signup')} className="btn-primary w-full flex items-center justify-center gap-2">
                Get Started <ArrowRight size={16} />
              </button>
              <button onClick={() => setMode('login')} className="btn-ghost w-full">
                I have an account
              </button>
              {/* DEV only */}
              <button onClick={devSkip} className="text-xs text-forest-700 mt-2 underline">
                Skip (dev mode)
              </button>
            </div>
          </motion.div>
        )}

        {mode === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="w-full max-w-sm"
          >
            <h2 className="font-display text-2xl text-forest-300 mb-6">Welcome back</h2>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <input
                type="text" placeholder="Username" value={username}
                onChange={e => setUsername(e.target.value)}
                className="bg-forest-800 border border-forest-700 rounded-xl px-4 py-3 text-forest-300 font-body outline-none focus:border-forest-500 w-full"
              />
              <input
                type="password" placeholder="Password" value={password}
                onChange={e => setPassword(e.target.value)}
                className="bg-forest-800 border border-forest-700 rounded-xl px-4 py-3 text-forest-300 font-body outline-none focus:border-forest-500 w-full"
              />
              {error && <p className="text-red-400 text-xs font-body">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Logging in...' : 'Log In'}
              </button>
              <button type="button" onClick={() => setMode('welcome')} className="text-xs text-forest-500 font-body">
                ← Back
              </button>
            </form>
          </motion.div>
        )}

        {mode === 'signup' && (
          <motion.div
            key="signup"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="w-full max-w-sm"
          >
            <h2 className="font-display text-2xl text-forest-300 mb-6">Create account</h2>
            <form onSubmit={handleSignup} className="flex flex-col gap-4">
              <input
                type="text" placeholder="Your name" value={name}
                onChange={e => setName(e.target.value)}
                className="bg-forest-800 border border-forest-700 rounded-xl px-4 py-3 text-forest-300 font-body outline-none focus:border-forest-500 w-full"
              />
              <input
                type="email" placeholder="Email" value={email}
                onChange={e => setEmail(e.target.value)}
                className="bg-forest-800 border border-forest-700 rounded-xl px-4 py-3 text-forest-300 font-body outline-none focus:border-forest-500 w-full"
              />
              <input
                type="password" placeholder="Password" value={password}
                onChange={e => setPassword(e.target.value)}
                className="bg-forest-800 border border-forest-700 rounded-xl px-4 py-3 text-forest-300 font-body outline-none focus:border-forest-500 w-full"
              />
              {error && <p className="text-red-400 text-xs font-body">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Creating...' : 'Create Account'}
              </button>
              <button type="button" onClick={() => setMode('welcome')} className="text-xs text-forest-500 font-body">
                ← Back
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
