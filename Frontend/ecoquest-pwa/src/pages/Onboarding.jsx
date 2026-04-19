import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'

const QUESTIONS = [
  { key: 'age',             label: 'How old are you?',                        options: ['18-24', '25-34', '35-44', '45+'] },
  { key: 'gender',          label: 'What is your gender?',                    options: ['Male', 'Female', 'Non-binary', 'Prefer not to say'] },
  { key: 'activity_level',  label: 'How active are you outdoors?',            options: ['Rarely', 'Sometimes', 'Often', 'Every day'] },
  { key: 'preferred_time',  label: 'What time do you prefer questing?',       options: ['Morning', 'Afternoon', 'Evening', 'Flexible'] },
  { key: 'nature_interest', label: "What's your main nature interest?",       options: ['Birds', 'Insects', 'Marine life', 'Plants'] },
  { key: 'transport_mode',  label: 'How do you usually get around?',          options: ['Walk', 'Bike', 'Public transit', 'Car'] },
  { key: 'quest_style',     label: "What's your quest style?",                options: ['Solo explorer', 'Small group', 'Big group', 'Flexible'] },
  { key: 'travel_distance', label: 'How far will you travel for a quest?',    options: ['<1 mile', '1-5 miles', '5-10 miles', '10+ miles'] },
  { key: 'experience_level',label: 'How experienced are you with wildlife?',  options: ['Beginner', 'Some experience', 'Experienced', 'Expert'] },
  { key: 'motivation',      label: 'What matters most to you?',               options: ['Learning', 'Adventure', 'Conservation', 'Social'] },
]

const getRegisteredUsers = () => {
  const stored = localStorage.getItem('ecoquest_all_users')
  return stored ? JSON.parse(stored) : {}
}

const saveRegisteredUsers = (users) => {
  localStorage.setItem('ecoquest_all_users', JSON.stringify(users))
}

const generateUserId = () =>
  'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()

export default function Onboarding({ onAuthChange }) {
  const [step, setStep]         = useState('welcome')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [answers, setAnswers]   = useState({})
  const [qIndex, setQIndex]     = useState(0)
  const [error, setError]       = useState(null)
  const [saving, setSaving]     = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('ecoquest_token')
    if (token) navigate('/')
  }, [])

  const clearError = () => setError(null)

  const handleRegister = () => {
    const trimmed = username.trim()
    if (!trimmed)            { setError('Please enter a username');                return }
    if (password.length < 4) { setError('Password must be at least 4 characters'); return }

    // Local duplicate check first
    const allUsers = getRegisteredUsers()
    if (allUsers[trimmed.toLowerCase()]) {
      setError('That username is already taken. Please log in instead.')
      return
    }

    clearError()
    setQIndex(0)
    setStep('questions')
  }

  const handleAnswer = (key, value) => {
    const updated = { ...answers, [key]: value }
    setAnswers(updated)
    if (qIndex < QUESTIONS.length - 1) {
      setQIndex(qIndex + 1)
    } else {
      completeRegistration(updated)
    }
  }

  const completeRegistration = async (finalAnswers) => {
    const allUsers  = getRegisteredUsers()
    const trimmed   = username.trim()
    const newUserId = generateUserId()
    setSaving(true)

    const userProfile = {
      id:            newUserId,
      username:      trimmed,
      password,
      answers:       finalAnswers,
      xp:            0,
      level:         1,
      registered_at: new Date().toISOString(),
    }

    try {
      // ✅ Check with backend BEFORE saving locally
      // Backend returns 409 or { error: 'username_taken' } if username exists in DynamoDB
      const res = await fetch('https://xdg48s4j3h.execute-api.us-east-2.amazonaws.com/dev/profile/save', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(userProfile),
      })

      const data = await res.json()

      // Block if username already exists in DynamoDB (covers cross-device duplicates)
      if (res.status === 409 || data.error === 'username_taken') {
        setError('That username is already taken globally. Please choose another.')
        setSaving(false)
        setStep('register')
        return
      }

    } catch (err) {
      // Backend unreachable — fall through and save locally only
      console.warn('Backend unreachable — saving locally only:', err)
    }

    // Save locally only after backend has accepted it (or was unreachable)
    allUsers[trimmed.toLowerCase()] = userProfile
    saveRegisteredUsers(allUsers)
    localStorage.setItem('ecoquest_token', newUserId)
    localStorage.setItem('ecoquest_user',  JSON.stringify(userProfile))

    setSaving(false)
    onAuthChange()
    navigate('/')
  }

  const handleLogin = () => {
    const trimmed = username.trim()
    if (!trimmed)  { setError('Please enter your username'); return }
    if (!password) { setError('Please enter your password'); return }

    const allUsers = getRegisteredUsers()
    const found    = allUsers[trimmed.toLowerCase()]

    if (!found) {
      setError('Username not found. Please register first.')
      return
    }
    if (found.password !== password) {
      setError('Incorrect password. Please try again.')
      return
    }

    clearError()
    localStorage.setItem('ecoquest_token', found.id)
    localStorage.setItem('ecoquest_user',  JSON.stringify(found))

    onAuthChange()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6"
         style={{ background: 'radial-gradient(ellipse at top, #1e3a1e 0%, #0d1a0d 60%)' }}>
      <AnimatePresence mode="wait">

        {/* ── WELCOME ── */}
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
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { clearError(); setUsername(''); setPassword(''); setStep('register') }}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                Create Account <ArrowRight size={16} />
              </button>
              <button
                onClick={() => { clearError(); setUsername(''); setPassword(''); setStep('login') }}
                className="btn-ghost w-full"
              >
                Sign In
              </button>
            </div>
          </motion.div>
        )}

        {/* ── REGISTER ── */}
        {step === 'register' && (
          <motion.div key="register"
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            className="w-full max-w-sm"
          >
            <h2 className="font-display text-2xl text-forest-300 mb-1">Create Account</h2>
            <p className="text-xs text-forest-500 font-body mb-6">
              Choose a unique username and password
            </p>
            <div className="flex flex-col gap-3 mb-4">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={e => { setUsername(e.target.value); clearError() }}
                className="w-full bg-forest-800 border border-forest-700 rounded-xl px-4 py-3 text-forest-300 font-body outline-none focus:border-forest-500"
              />
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Password (min 4 characters)"
                  value={password}
                  onChange={e => { setPassword(e.target.value); clearError() }}
                  onKeyDown={e => e.key === 'Enter' && handleRegister()}
                  className="w-full bg-forest-800 border border-forest-700 rounded-xl px-4 py-3 pr-11 text-forest-300 font-body outline-none focus:border-forest-500"
                />
                <button
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-forest-500"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {error && <p className="text-red-400 text-xs font-body mb-3">{error}</p>}
            <button onClick={handleRegister} className="btn-primary w-full mb-2">
              Continue to Questions
            </button>
            <button
              onClick={() => { clearError(); setStep('welcome') }}
              className="text-xs text-forest-500 font-body mt-1 w-full text-center"
            >
              ← Back
            </button>
            <p className="text-xs text-forest-600 font-body mt-6 text-center">
              Already have an account?{' '}
              <button
                onClick={() => { clearError(); setStep('login') }}
                className="text-forest-400 underline"
              >
                Sign in here
              </button>
            </p>
          </motion.div>
        )}

        {/* ── LOGIN ── */}
        {step === 'login' && (
          <motion.div key="login"
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            className="w-full max-w-sm"
          >
            <h2 className="font-display text-2xl text-forest-300 mb-1">Welcome back 👋</h2>
            <p className="text-xs text-forest-500 font-body mb-6">
              Sign in with your username and password
            </p>
            <div className="flex flex-col gap-3 mb-4">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={e => { setUsername(e.target.value); clearError() }}
                className="w-full bg-forest-800 border border-forest-700 rounded-xl px-4 py-3 text-forest-300 font-body outline-none focus:border-forest-500"
              />
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); clearError() }}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  className="w-full bg-forest-800 border border-forest-700 rounded-xl px-4 py-3 pr-11 text-forest-300 font-body outline-none focus:border-forest-500"
                />
                <button
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-forest-500"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {error && <p className="text-red-400 text-xs font-body mb-3">{error}</p>}
            <button onClick={handleLogin} className="btn-primary w-full mb-2">
              Sign In
            </button>
            <button
              onClick={() => { clearError(); setStep('welcome') }}
              className="text-xs text-forest-500 font-body mt-1 w-full text-center"
            >
              ← Back
            </button>
            <p className="text-xs text-forest-600 font-body mt-6 text-center">
              Don't have an account?{' '}
              <button
                onClick={() => { clearError(); setStep('register') }}
                className="text-forest-400 underline"
              >
                Register here
              </button>
            </p>
          </motion.div>
        )}

        {/* ── QUESTIONS ── */}
        {step === 'questions' && (
          <motion.div key={`question-${qIndex}`}
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            className="w-full max-w-sm"
          >
            {/* Saving spinner — shows while waiting for backend response */}
            {saving ? (
              <div className="flex flex-col items-center gap-4 py-12">
                <motion.div animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="text-4xl">🌿
                </motion.div>
                <p className="font-body text-forest-400 text-sm">Creating your account...</p>
              </div>
            ) : (
              <>
                <div className="flex gap-1 mb-6">
                  {QUESTIONS.map((_, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      i <= qIndex ? 'bg-forest-500' : 'bg-forest-800'
                    }`} />
                  ))}
                </div>
                <p className="text-xs text-forest-500 font-mono mb-2">
                  Question {qIndex + 1} of {QUESTIONS.length}
                </p>
                <h2 className="font-display text-xl text-forest-300 mb-6">
                  {QUESTIONS[qIndex].label}
                </h2>
                <div className="flex flex-col gap-3">
                  {QUESTIONS[qIndex].options.map(option => (
                    <motion.button key={option} whileTap={{ scale: 0.97 }}
                      onClick={() => handleAnswer(QUESTIONS[qIndex].key, option)}
                      className="card text-left text-sm font-body text-forest-300 hover:border-forest-500 hover:bg-forest-700 transition-all active:scale-95">
                      {option}
                    </motion.button>
                  ))}
                </div>
                {qIndex > 0 && (
                  <button onClick={() => setQIndex(qIndex - 1)}
                    className="text-xs text-forest-500 font-body mt-4 w-full text-center">
                    ← Previous question
                  </button>
                )}
              </>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}