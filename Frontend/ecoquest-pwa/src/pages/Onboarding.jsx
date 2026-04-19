import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Check } from 'lucide-react'
import { register } from '../services/authService'
import { useAuth } from '../hooks/useAuth'

const INTEREST_OPTIONS = [
  'birds', 'butterflies', 'tide pools', 'hiking',
  'marine life', 'plants', 'photography', 'reptiles'
]

export default function Onboarding() {
  const [step, setStep]           = useState('welcome')
  const [username, setUsername]   = useState('')
  const [password, setPassword]   = useState('')
  const [interests, setInterests] = useState([])
  const [error, setError]         = useState(null)
  const { login, loading } = useAuth()
  const navigate = useNavigate()

  const toggleInterest = (i) =>
    setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])

  const devSkip = () => {
    localStorage.setItem('ecoquest_token', 'dev_token')
    localStorage.setItem('ecoquest_user', JSON.stringify({
      id:        'eb74cf1e-61d3-428f-bff8-5ea97f20e257',
      name:      'EcoQuester',
      interests: ['birds', 'hiking'],
      xp:        0,
      level:     1,
    }))
    window.location.href = '/'
  }

  const handleRegister = async () => {
    if (!username.trim())       { setError('Please enter a name');        return }
    if (interests.length === 0) { setError('Pick at least one interest'); return }
    setError(null)
    setStep('loading')
    try {
      const res = await register(username.trim(), interests)
      const { userId } = res.data
      localStorage.setItem('ecoquest_token', userId)
      localStorage.setItem('ecoquest_user', JSON.stringify({
        id: userId, name: username.trim(), interests, xp: 0, level: 1,
      }))
      navigate('/')
    } catch (err) {
      setError('Registration failed — check your connection and try again.')
      setStep('interests')
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!username.trim()) { setError('Enter your username'); return }
    if (!password.trim()) { setError('Enter your password'); return }
    setError(null)
    setStep('loading')
    try {
      await login(username, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed — check your credentials')
      setStep('login')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6"
         style={{ background: 'radial-gradient(ellipse at top, #1e3a1e 0%, #0d1a0d 60%)' }}>
      <AnimatePresence mode="wait">

        {step === 'welcome' && (
          <motion.div key="welcome"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-sm text-center"
          >
            <motion.div animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="text-7xl mb-6">🐾
            </motion.div>
            <h1 className="font-display text-4xl font-bold text-forest-300 mb-2">EcoQuest</h1>
            <p className="font-body text-forest-500 text-sm mb-10">
              Discover wildlife. Go green. Earn your mark.
            </p>
            <input
              type="text"
              placeholder="Enter your name to start"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && username.trim() && setStep('interests')}
              className="w-full bg-forest-800 border border-forest-700 rounded-xl px-4 py-3 text-forest-300 font-body outline-none focus:border-forest-500 mb-4 text-center"
            />
            <button
              onClick={() => username.trim() ? setStep('interests') : setError('Enter your name first')}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              Get Started <ArrowRight size={16} />
            </button>

            <button
              onClick={() => { setUsername(''); setPassword(''); setError(null); setStep('login') }}
              className="text-xs text-forest-400 font-body mt-3 w-full text-center hover:text-forest-300"
            >
              Already have an account? Log in
            </button>

            {error && <p className="text-red-400 text-xs font-body mt-3">{error}</p>}

            {/* DEV SKIP — remove before final presentation */}
            <button onClick={devSkip} className="text-xs text-forest-700 mt-4 underline w-full text-center">
              Skip (dev mode)
            </button>
          </motion.div>
        )}

        {step === 'login' && (
          <motion.div key="login"
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            className="w-full max-w-sm"
          >
            <h2 className="font-display text-2xl text-forest-300 mb-6">Welcome back</h2>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="bg-forest-800 border border-forest-700 rounded-xl px-4 py-3 text-forest-300 font-body outline-none focus:border-forest-500 w-full"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="bg-forest-800 border border-forest-700 rounded-xl px-4 py-3 text-forest-300 font-body outline-none focus:border-forest-500 w-full"
              />
              {error && <p className="text-red-400 text-xs font-body">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>
              <button
                type="button"
                onClick={() => { setUsername(''); setPassword(''); setError(null); setStep('welcome') }}
                className="text-xs text-forest-500 font-body text-center hover:text-forest-300"
              >
                ← Back to signup
              </button>
            </form>
          </motion.div>
        )}

        {step === 'interests' && (
          <motion.div key="interests"
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            className="w-full max-w-sm"
          >
            <h2 className="font-display text-2xl text-forest-300 mb-1">Hi {username}! 👋</h2>
            <p className="text-xs text-forest-500 font-body mb-6">
              Pick your nature interests — we'll match you with the perfect quests and partners
            </p>
            <div className="flex flex-wrap gap-2 mb-8">
              {INTEREST_OPTIONS.map(interest => {
                const selected = interests.includes(interest)
                return (
                  <motion.button key={interest} whileTap={{ scale: 0.9 }}
                    onClick={() => toggleInterest(interest)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-body border transition-all ${
                      selected ? 'bg-forest-600 border-forest-500 text-forest-300'
                               : 'bg-forest-800 border-forest-700 text-forest-500'
                    }`}>
                    {selected && <Check size={12} />}{interest}
                  </motion.button>
                )
              })}
            </div>
            {error && <p className="text-red-400 text-xs font-body mb-3">{error}</p>}
            <button onClick={handleRegister} disabled={interests.length === 0}
              className="btn-primary w-full disabled:opacity-40">
              Create My Account
            </button>
            <button onClick={() => setStep('welcome')}
              className="text-xs text-forest-500 font-body mt-3 w-full text-center">
              ← Back
            </button>
          </motion.div>
        )}

        {step === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4">
            <motion.div animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="text-4xl">🌿
            </motion.div>
            <p className="font-body text-forest-400 text-sm">Setting up your EcoQuest...</p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}