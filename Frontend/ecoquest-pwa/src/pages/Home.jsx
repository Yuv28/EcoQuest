import { motion } from 'framer-motion'
import { Bell, Zap } from 'lucide-react'
import XPBar from '../components/XPBar'
import QuestCard from '../components/QuestCard'

// Placeholder data — replace with real Lambda calls
const MOCK_USER = { name: 'Alex', level: 4, xp: 1240, xpMax: 2000 }
const MOCK_QUESTS = [
  { id: '1', title: 'Find a Monarch', species: 'Danaus plexippus', location: 'Balboa Park', xp: 200, difficulty: 'easy',   imageUrl: null },
  { id: '2', title: 'Spot a Bufflehead', species: 'Bucephala albeola', location: 'Mission Bay', xp: 350, difficulty: 'medium', imageUrl: null },
  { id: '3', title: 'Great Blue Heron Watch', species: 'Ardea herodias', location: 'San Elijo Lagoon', xp: 150, difficulty: 'easy', imageUrl: null },
]
const MOCK_BADGES = ['🦋', '🦆', '🌿', '🐦', '⚡']

export default function Home() {
  const user = MOCK_USER

  return (
    <div className="page-scroll px-4 pt-6 pb-4">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <p className="text-xs text-forest-500 font-body">Welcome back,</p>
          <h1 className="font-display text-xl font-bold text-forest-300">{user.name} 🌿</h1>
        </div>
        <button className="w-9 h-9 rounded-full bg-forest-800 border border-forest-700 flex items-center justify-center">
          <Bell size={16} className="text-forest-500" />
        </button>
      </motion.div>

      {/* XP Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card mb-6"
        style={{ background: 'linear-gradient(135deg, #1e3a1e, #2d5a2d)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-amber-400" style={{ color: 'var(--accent-amber)' }} />
            <span className="font-mono text-xs text-forest-400">Level {user.level} EcoQuester</span>
          </div>
          <span className="xp-badge">{user.xp} XP</span>
        </div>
        <XPBar current={user.xp} max={user.xpMax} level={user.level} />
      </motion.div>

      {/* Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-6"
      >
        <h2 className="font-display text-sm text-forest-400 mb-3">Your Badges</h2>
        <div className="flex gap-2">
          {MOCK_BADGES.map((b, i) => (
            <motion.div
              key={i}
              whileTap={{ scale: 0.85 }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="w-10 h-10 rounded-full bg-forest-800 border border-forest-700 flex items-center justify-center text-lg"
            >
              {b}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Active Quests */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-sm text-forest-400">Suggested Quests</h2>
          <span className="text-xs text-forest-600 font-body">San Diego, CA</span>
        </div>
        <div className="flex flex-col gap-3">
          {MOCK_QUESTS.map((q, i) => (
            <QuestCard key={q.id} quest={q} delay={0.25 + i * 0.08} />
          ))}
        </div>
      </div>

    </div>
  )
}
