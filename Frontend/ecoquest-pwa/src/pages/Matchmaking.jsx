// src/pages/Matchmaking.jsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Search, UserPlus, Check, Loader } from 'lucide-react'
import { findMatches } from '../services/matchService'

// Avatars assigned by index since API doesn't return them
const AVATARS = ['🧑', '👩', '🧔', '👧', '👨', '🧕', '👦', '🧓']

export default function Matchmaking() {
  const [invited, setInvited]   = useState([])
  const [tab, setTab]           = useState('suggested')
  const [matches, setMatches]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [search, setSearch]     = useState('')

  const invite = (id) => setInvited(prev => prev.includes(id) ? prev : [...prev, id])

  useEffect(() => {
  const loadMatches = async () => {
    try {
      setLoading(true)
      setError(null)

      const stored = localStorage.getItem('ecoquest_user')
      const userId = stored ? JSON.parse(stored).id : null

      if (!userId) {
        setError('Not logged in')
        return
      }

      const res = await findMatches(userId)
      const recommended = res.data?.recommendedUsers || []
      setMatches(recommended)
    } catch (err) {
      console.error('Match load failed:', err)
      setError('Could not load suggestions. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (tab === 'suggested') loadMatches()
}, [tab])

  // Filter by search input
  const filtered = matches.filter(m =>
    m.username?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page-scroll px-4 pt-6 pb-4">

      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-2xl font-bold text-forest-300 mb-1"
      >
        Find Quest Partners
      </motion.h1>
      <p className="text-xs text-forest-500 font-body mb-5">
        Matched by interests, location & eco style
      </p>

      {/* Tab toggle */}
      <div className="flex bg-forest-800 rounded-xl p-1 mb-5 border border-forest-700">
        {['suggested', 'friends'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-xs font-body font-semibold capitalize transition-all ${
              tab === t ? 'bg-forest-600 text-forest-300' : 'text-forest-500'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-500" />
        <input
          placeholder="Search by name or interest..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-forest-800 border border-forest-700 rounded-xl pl-9 pr-4 py-3 text-sm text-forest-300 font-body outline-none focus:border-forest-500 placeholder:text-forest-600"
        />
      </div>

      {/* States: loading / error / empty / results */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader size={24} className="text-forest-500 animate-spin" />
          <p className="text-xs text-forest-500 font-body">Finding your best quest partners...</p>
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-12">
          <p className="text-sm text-red-400 font-body">{error}</p>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-forest-500 font-body">No matches found yet. Complete your profile to get suggestions!</p>
        </div>
      )}

      {/* Match cards */}
      {!loading && !error && (
        <div className="flex flex-col gap-3">
          {filtered.map((m, i) => (
            <motion.div
              key={m.userId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="card flex items-center gap-3"
            >
              <div className="w-11 h-11 rounded-full bg-forest-700 flex items-center justify-center text-2xl flex-shrink-0">
                {AVATARS[i % AVATARS.length]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-body font-semibold text-sm text-forest-300">
                    {m.username}
                  </span>
                  {/* Compatibility score badge */}
                  <span className="text-xs bg-forest-700 text-forest-400 px-2 py-0.5 rounded-full font-body">
                    {Math.round(m.score * 100)}% match
                  </span>
                </div>
                <div className="flex gap-1 mt-1 flex-wrap">
                  <span className="text-xs bg-forest-700 text-forest-400 px-2 py-0.5 rounded-full font-body">
                    Cluster {m.cluster}
                  </span>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => invite(m.userId)}
                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                  invited.includes(m.userId)
                    ? 'bg-forest-600 border border-forest-500'
                    : 'bg-forest-800 border border-forest-700'
                }`}
              >
                {invited.includes(m.userId)
                  ? <Check size={15} className="text-forest-300" />
                  : <UserPlus size={15} className="text-forest-500" />
                }
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Start group quest CTA */}
      <AnimatePresence>
        {invited.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-20 left-4 right-4 z-40"
          >
            <button className="btn-primary w-full flex items-center justify-center gap-2 shadow-lg">
              <Users size={16} />
              Start Group Quest with {invited.length} partner{invited.length > 1 ? 's' : ''}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}