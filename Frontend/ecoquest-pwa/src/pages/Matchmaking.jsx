import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Users, Search, UserPlus, Check, MapPin, Zap, X, RefreshCw, Loader } from 'lucide-react'
import { findMatches, getSuggestedMatches, generateGroupQuest } from '../services/matchService'
import { saveQuest } from '../services/questStorage'

const AVATARS = ['🧑', '👩', '🧔', '👱', '🧕', '👨', '🧒', '👧']

// ── Mock matches — fallback when backend isn't ready ──────────────────────────
const MOCK_MATCHES = [
  { user_id: 'mock_001', username: 'Jordan', xp: 980,  score: 0.95, cluster: 1, answers: { nature_interest: 'Birds',       quest_style: 'Small group',   activity_level: 'Often'     } },
  { user_id: 'mock_002', username: 'Priya',  xp: 1560, score: 0.91, cluster: 1, answers: { nature_interest: 'Insects',     quest_style: 'Small group',   activity_level: 'Every day' } },
  { user_id: 'mock_003', username: 'Marcus', xp: 720,  score: 0.87, cluster: 2, answers: { nature_interest: 'Marine life', quest_style: 'Flexible',      activity_level: 'Sometimes' } },
  { user_id: 'mock_004', username: 'Elena',  xp: 1200, score: 0.83, cluster: 1, answers: { nature_interest: 'Birds',       quest_style: 'Small group',   activity_level: 'Often'     } },
  { user_id: 'mock_005', username: 'Felix',  xp: 430,  score: 0.78, cluster: 3, answers: { nature_interest: 'Plants',      quest_style: 'Solo explorer', activity_level: 'Rarely'    } },
]

// ── Mock quest — fallback when backend isn't ready ────────────────────────────
const MOCK_QUEST = {
  questId:         'quest_mock_001',
  species_target:  'Monarch Butterfly',
  scientific_name: 'Danaus plexippus',
  location:        'Balboa Park, San Diego',
  description:     'Head to the milkweed patches near the Natural History Museum in Balboa Park. Monarch butterflies are currently migrating through San Diego — keep your eyes on the flowering plants!',
  challenges: [
    { id: 'c1', label: 'Get there eco-friendly (walk, bike, or bus)', xp: 50 },
    { id: 'c2', label: 'Find the Monarch and observe for 2 minutes',  xp: 75 },
    { id: 'c3', label: 'Place a small orange slice near the butterfly', xp: 50 },
    { id: 'c4', label: 'Take a photo and submit to iNaturalist',       xp: 25 },
  ],
  xp: 200,
}

export default function Matchmaking() {
  const [matches,       setMatches]       = useState([])
  const [invited,       setInvited]       = useState([])
  const [tab,           setTab]           = useState('suggested')
  const [search,        setSearch]        = useState('')
  const [loadingMatch,  setLoadingMatch]  = useState(true)
  const [loadingQuest,  setLoadingQuest]  = useState(false)
  const [quest,         setQuest]         = useState(null)
  const [alreadyExists, setAlreadyExists] = useState(false)
  const [error,         setError]         = useState(null)
  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem('ecoquest_user') || '{}')

  // ── Load ML-recommended matches on mount / tab change ────────────────────
  useEffect(() => {
    if (tab === 'suggested') fetchMatches()
  }, [tab])

  const fetchMatches = async () => {
    setLoadingMatch(true)
    setInvited([])
    setQuest(null)
    setAlreadyExists(false)
    setError(null)
    try {
      // ✅ Try ML-powered endpoint first (findMatches uses /match/recommend)
      const res = await findMatches(user.id)
      const recommended = res.data?.recommendedUsers || res.data?.matches || []

      // Normalise field names — ML model may return userId or user_id
      const normalised = recommended.map(m => ({
        user_id:  m.userId  || m.user_id,
        username: m.username,
        xp:       m.xp      || 0,
        score:    m.score   || 0,
        cluster:  m.cluster || null,
        answers:  m.answers || {},
      }))
      setMatches(normalised)
    } catch (err) {
      // Fallback: try suggest endpoint, then mock
      try {
        const res = await getSuggestedMatches(user.id)
        setMatches(res.data.matches)
      } catch {
        await new Promise(r => setTimeout(r, 800))
        setMatches(MOCK_MATCHES)
      }
    } finally {
      setLoadingMatch(false)
    }
  }

  const toggleInvite = (userId) => {
    setInvited(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  // ── Start group quest: call ML model to get species recommendation ─────────
  const handleStartQuest = async () => {
    if (invited.length === 0) return
    setLoadingQuest(true)
    setError(null)

    let location = { latitude: 32.7157, longitude: -117.1611 }
    try {
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
      )
      location = { latitude: pos.coords.latitude, longitude: pos.coords.longitude }
    } catch {
      console.warn('Location unavailable — using default San Diego coords')
    }

    const groupUserIds = [user.id, ...invited]

    try {
      const res = await generateGroupQuest(groupUserIds, location)
      setQuest(res.data)
    } catch {
      await new Promise(r => setTimeout(r, 1200))
      setQuest(MOCK_QUEST)
    } finally {
      setLoadingQuest(false)
    }
  }

  // ── Save quest to localStorage and navigate ───────────────────────────────
  const handleLetsGo = () => {
    const wasAdded = saveQuest({
      ...quest,
      addedAt:   new Date().toISOString(),
      completed: false,
      group:     [user.id, ...invited],
    })
    setAlreadyExists(!wasAdded)
    navigate('/quests')
  }

  const getAvatar = (userId) =>
    AVATARS[parseInt(userId.replace(/\D/g, '').slice(-1)) % AVATARS.length] || '🧑'

  // Filter by search
  const filtered = matches.filter(m =>
    m.username?.toLowerCase().includes(search.toLowerCase())
  )

  // ── Quest result screen ───────────────────────────────────────────────────
  if (quest) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="page-scroll px-4 pt-6 pb-4"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-forest-500 font-body">Your group quest is ready!</p>
            <h1 className="font-display text-2xl font-bold text-forest-300">🎯 Quest Assigned</h1>
          </div>
          <button
            onClick={() => { setQuest(null); setInvited([]) }}
            className="w-8 h-8 rounded-full bg-forest-800 border border-forest-700 flex items-center justify-center"
          >
            <X size={14} className="text-forest-500" />
          </button>
        </div>

        <AnimatePresence>
          {alreadyExists && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-4 px-4 py-3 rounded-xl text-xs font-body text-amber-300 border border-amber-800 bg-amber-900/30"
            >
              ⚠️ This quest is already in your quests tab
            </motion.div>
          )}
        </AnimatePresence>

        {/* Species card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="card mb-4"
          style={{ background: 'linear-gradient(135deg, #1e3a1e, #2d5a2d)' }}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-forest-700 flex items-center justify-center text-4xl flex-shrink-0">
              🦋
            </div>
            <div className="flex-1">
              <h2 className="font-display text-xl font-bold text-forest-300">{quest.species_target}</h2>
              <p className="text-xs text-forest-500 italic font-body">{quest.scientific_name}</p>
              <div className="flex items-center gap-1 mt-1">
                <MapPin size={10} className="text-forest-500" />
                <span className="text-xs text-forest-500 font-body">{quest.location}</span>
              </div>
            </div>
            <span className="xp-badge">+{quest.xp} XP</span>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-sm text-forest-400 font-body leading-relaxed mb-5"
        >
          {quest.description}
        </motion.p>

        {/* Challenges */}
        <h3 className="font-display text-sm text-forest-400 mb-3">Your Challenges</h3>
        <div className="flex flex-col gap-2 mb-6">
          {quest.challenges.map((c, i) => (
            <motion.div key={c.id}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.07 }}
              className="card flex items-center gap-3"
            >
              <div className="w-6 h-6 rounded-full bg-forest-700 border border-forest-600 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-mono text-forest-400">{i + 1}</span>
              </div>
              <span className="text-sm font-body text-forest-300 flex-1">{c.label}</span>
              <span className="xp-badge">+{c.xp}</span>
            </motion.div>
          ))}
        </div>

        {/* Group members */}
        <h3 className="font-display text-sm text-forest-400 mb-3">Your Group</h3>
        <div className="flex gap-2 mb-6">
          {[user.id, ...invited].map((uid) => {
            const matchedUser = matches.find(m => m.user_id === uid)
            const label = uid === user.id ? (user.username || 'You') : (matchedUser?.username || 'Partner')
            return (
              <div key={uid} className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full bg-forest-700 border-2 border-forest-500 flex items-center justify-center text-lg">
                  {getAvatar(uid)}
                </div>
                <span className="text-xs text-forest-500 font-body">{label}</span>
              </div>
            )
          })}
        </div>

        <motion.button whileTap={{ scale: 0.97 }} onClick={handleLetsGo}
          className="btn-primary w-full flex items-center justify-center gap-2">
          <Zap size={16} /> Let's Go!
        </motion.button>
      </motion.div>
    )
  }

  // ── Main matchmaking screen ───────────────────────────────────────────────
  return (
    <div className="page-scroll px-4 pt-6 pb-4">

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-1">
        <h1 className="font-display text-2xl font-bold text-forest-300">Find Partners</h1>
        <motion.button whileTap={{ scale: 0.85 }} onClick={fetchMatches}
          disabled={loadingMatch}
          className="w-8 h-8 rounded-full bg-forest-800 border border-forest-700 flex items-center justify-center">
          <motion.div animate={loadingMatch ? { rotate: 360 } : {}}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
            <RefreshCw size={14} className="text-forest-500" />
          </motion.div>
        </motion.button>
      </motion.div>
      <p className="text-xs text-forest-500 font-body mb-5">
        ML-matched by your quiz answers and interests
      </p>

      {/* Tab toggle */}
      <div className="flex bg-forest-800 rounded-xl p-1 mb-4 border border-forest-700">
        {['suggested', 'friends'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-xs font-body font-semibold capitalize transition-all ${
              tab === t ? 'bg-forest-600 text-forest-300' : 'text-forest-500'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-500" />
        <input
          placeholder="Search by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-forest-800 border border-forest-700 rounded-xl pl-9 pr-4 py-3 text-sm text-forest-300 font-body outline-none focus:border-forest-500 placeholder:text-forest-600"
        />
      </div>

      {/* Loading */}
      {loadingMatch && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="card flex items-center gap-3 animate-pulse">
              <div className="w-11 h-11 rounded-full bg-forest-700 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-forest-700 rounded w-1/3" />
                <div className="h-2 bg-forest-700 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!loadingMatch && error && (
        <div className="text-center py-12">
          <p className="text-sm text-red-400 font-body">{error}</p>
        </div>
      )}

      {/* Empty */}
      {!loadingMatch && !error && filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-forest-500 font-body">
            No matches found. Complete your profile to get suggestions!
          </p>
        </div>
      )}

      {/* Match cards */}
      {!loadingMatch && !error && filtered.length > 0 && (
        <div className="flex flex-col gap-3">
          {filtered.map((match, i) => (
            <motion.div key={match.user_id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`card flex items-center gap-3 cursor-pointer transition-colors ${
                invited.includes(match.user_id)
                  ? 'border-forest-500 bg-forest-700/50'
                  : 'hover:border-forest-600'
              }`}
              onClick={() => toggleInvite(match.user_id)}
            >
              <div className="w-11 h-11 rounded-full bg-forest-700 flex items-center justify-center text-2xl flex-shrink-0">
                {getAvatar(match.user_id)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-body font-semibold text-sm text-forest-300">
                    {match.username}
                  </span>
                  <span className="xp-badge">{match.xp} XP</span>
                  {/* ML score badge — shown when available from model */}
                  {match.score > 0 && (
                    <span className="text-xs bg-forest-700 text-forest-400 px-2 py-0.5 rounded-full font-body">
                      {Math.round(match.score * 100)}% match
                    </span>
                  )}
                  {match.cluster !== null && (
                    <span className="text-xs bg-forest-700 text-forest-400 px-2 py-0.5 rounded-full font-body">
                      Cluster {match.cluster}
                    </span>
                  )}
                </div>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {match.answers && Object.entries(match.answers)
                    .slice(0, 3)
                    .map(([key, val]) => (
                      <span key={key}
                        className="text-xs bg-forest-700 text-forest-400 px-2 py-0.5 rounded-full font-body">
                        {val}
                      </span>
                    ))
                  }
                </div>
              </div>

              <motion.div whileTap={{ scale: 0.85 }}
                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                  invited.includes(match.user_id)
                    ? 'bg-forest-500 border border-forest-400'
                    : 'bg-forest-800 border border-forest-700'
                }`}
              >
                {invited.includes(match.user_id)
                  ? <Check size={15} className="text-forest-300" />
                  : <UserPlus size={15} className="text-forest-500" />
                }
              </motion.div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Start quest CTA */}
      <AnimatePresence>
        {invited.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-20 left-4 right-4 z-40"
          >
            <motion.button whileTap={{ scale: 0.97 }}
              onClick={handleStartQuest}
              disabled={loadingQuest}
              className="btn-primary w-full flex items-center justify-center gap-2 shadow-lg"
            >
              {loadingQuest ? (
                <>
                  <motion.div animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="text-base">🌿
                  </motion.div>
                  Finding your quest...
                </>
              ) : (
                <>
                  <Users size={16} />
                  Start Quest with {invited.length} partner{invited.length > 1 ? 's' : ''}
                </>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}