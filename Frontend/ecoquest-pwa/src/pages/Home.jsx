import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Zap, Plus, X } from 'lucide-react'
import XPBar from '../components/XPBar'
import QuestCard from '../components/QuestCard'
import { createQuest } from '../services/questService'

// Species options the user can start a quest for
const SPECIES_OPTIONS = [
  { label: '🦋 Monarch Butterfly',   value: 'Monarch Butterfly'   },
  { label: '🦆 Bufflehead Duck',     value: 'Bufflehead Duck'     },
  { label: '🦅 Great Blue Heron',    value: 'Great Blue Heron'    },
  { label: '🐝 San Diego Bumblebee', value: 'San Diego Bumblebee' },
  { label: '⭐ Ochre Sea Star',       value: 'Ochre Sea Star'      },
  { label: '🦉 Burrowing Owl',       value: 'Burrowing Owl'       },
]

const MOCK_BADGES = ['🦋', '🦆', '🌿', '🐦', '⚡']

export default function Home() {
  const user = JSON.parse(localStorage.getItem('ecoquest_user') || '{}')

  const [quests, setQuests]           = useState([])
  const [showPicker, setShowPicker]   = useState(false)
  const [creating, setCreating]       = useState(false)
  const [error, setError]             = useState(null)
  const [successMsg, setSuccessMsg]   = useState(null)

  const handleCreateQuest = async (species) => {
    setShowPicker(false)
    setCreating(true)
    setError(null)
    try {
      // ✅ Real API call → POST /quest/create
      const res = await createQuest(user.id, species)
      const { questId, msg } = res.data

      // Add new quest to local list
      setQuests(prev => [{
        id:         questId,
        title:      `Find a ${species}`,
        species,
        location:   'San Diego, CA',
        xp:         200,
        difficulty: 'easy',
        imageUrl:   null,
      }, ...prev])

      setSuccessMsg(msg)
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err) {
      setError('Failed to create quest. Try again.')
      setTimeout(() => setError(null), 3000)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="page-scroll px-4 pt-6 pb-4">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-forest-500 font-body">Welcome back,</p>
          <h1 className="font-display text-xl font-bold text-forest-300">
            {user.name || 'EcoQuester'} 🌿
          </h1>
        </div>
        <button className="w-9 h-9 rounded-full bg-forest-800 border border-forest-700 flex items-center justify-center">
          <Bell size={16} className="text-forest-500" />
        </button>
      </motion.div>

      {/* XP Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }} className="card mb-6"
        style={{ background: 'linear-gradient(135deg, #1e3a1e, #2d5a2d)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap size={16} style={{ color: 'var(--accent-amber)' }} />
            <span className="font-mono text-xs text-forest-400">
              Level {user.level || 1} EcoQuester
            </span>
          </div>
          <span className="xp-badge">{user.xp || 0} XP</span>
        </div>
        <XPBar current={user.xp || 0} max={2000} level={user.level || 1} />
      </motion.div>

      {/* Badges */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }} className="mb-6">
        <h2 className="font-display text-sm text-forest-400 mb-3">Your Badges</h2>
        <div className="flex gap-2">
          {MOCK_BADGES.map((b, i) => (
            <motion.div key={i} whileTap={{ scale: 0.85 }}
              initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="w-10 h-10 rounded-full bg-forest-800 border border-forest-700 flex items-center justify-center text-lg">
              {b}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Toast messages */}
      <AnimatePresence>
        {successMsg && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 px-4 py-3 rounded-xl text-xs font-body text-forest-300 border border-forest-600"
            style={{ background: '#2d5a2d80' }}>
            ✅ {successMsg}
          </motion.div>
        )}
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 px-4 py-3 rounded-xl text-xs font-body text-red-300 border border-red-800 bg-red-900/40">
            ❌ {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quests section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-sm text-forest-400">My Quests</h2>
          <motion.button whileTap={{ scale: 0.85 }}
            onClick={() => setShowPicker(true)}
            className="flex items-center gap-1 text-xs font-body text-forest-400 bg-forest-800 border border-forest-700 px-3 py-1.5 rounded-full">
            <Plus size={12} /> New Quest
          </motion.button>
        </div>

        {creating && (
          <div className="card flex items-center gap-3 mb-3">
            <motion.div animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="text-xl">🌿</motion.div>
            <span className="text-sm font-body text-forest-400">Creating quest...</span>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {quests.map((q, i) => <QuestCard key={q.id} quest={q} delay={i * 0.06} />)}
          {quests.length === 0 && !creating && (
            <div className="text-center py-12 text-forest-600 font-body text-sm">
              No quests yet — tap <strong className="text-forest-500">+ New Quest</strong> to start! 🌱
            </div>
          )}
        </div>
      </div>

      {/* Species picker modal */}
      <AnimatePresence>
        {showPicker && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40" onClick={() => setShowPicker(false)} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-forest-900 border-t border-forest-700 rounded-t-3xl p-6"
              style={{ paddingBottom: 'env(safe-area-inset-bottom, 24px)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg text-forest-300">Choose a Species</h3>
                <button onClick={() => setShowPicker(false)}>
                  <X size={20} className="text-forest-500" />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {SPECIES_OPTIONS.map(({ label, value }) => (
                  <motion.button key={value} whileTap={{ scale: 0.97 }}
                    onClick={() => handleCreateQuest(value)}
                    className="card text-left text-sm font-body text-forest-300 hover:border-forest-500 transition-colors">
                    {label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  )
}
