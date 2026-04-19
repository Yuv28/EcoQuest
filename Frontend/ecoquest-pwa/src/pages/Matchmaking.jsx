import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Search, UserPlus, Check } from 'lucide-react'

const MOCK_MATCHES = [
  { id: 'u1', name: 'Jordan', interests: ['birds', 'hiking'], xp: 980,  avatar: '🧑' },
  { id: 'u2', name: 'Priya',  interests: ['butterflies', 'photography'], xp: 1560, avatar: '👩' },
  { id: 'u3', name: 'Marcus', interests: ['tide pools', 'marine life'],  xp: 720,  avatar: '🧔' },
]

export default function Matchmaking() {
  const [invited, setInvited] = useState([])
  const [tab, setTab]         = useState('suggested') // suggested | friends

  const invite = (id) => setInvited(prev => prev.includes(id) ? prev : [...prev, id])

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
          className="w-full bg-forest-800 border border-forest-700 rounded-xl pl-9 pr-4 py-3 text-sm text-forest-300 font-body outline-none focus:border-forest-500 placeholder:text-forest-600"
        />
      </div>

      {/* Match cards */}
      <div className="flex flex-col gap-3">
        {MOCK_MATCHES.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card flex items-center gap-3"
          >
            <div className="w-11 h-11 rounded-full bg-forest-700 flex items-center justify-center text-2xl flex-shrink-0">
              {m.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-body font-semibold text-sm text-forest-300">{m.name}</span>
                <span className="xp-badge">{m.xp} XP</span>
              </div>
              <div className="flex gap-1 mt-1 flex-wrap">
                {m.interests.map(int => (
                  <span key={int} className="text-xs bg-forest-700 text-forest-400 px-2 py-0.5 rounded-full font-body">
                    {int}
                  </span>
                ))}
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => invite(m.id)}
              className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                invited.includes(m.id)
                  ? 'bg-forest-600 border border-forest-500'
                  : 'bg-forest-800 border border-forest-700'
              }`}
            >
              {invited.includes(m.id)
                ? <Check size={15} className="text-forest-300" />
                : <UserPlus size={15} className="text-forest-500" />
              }
            </motion.button>
          </motion.div>
        ))}
      </div>

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
