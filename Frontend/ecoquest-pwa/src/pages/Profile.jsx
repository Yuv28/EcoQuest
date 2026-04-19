import { motion } from 'framer-motion'
import { LogOut, Leaf, Zap, Award, Map } from 'lucide-react'
import XPBar from '../components/XPBar'
import { useAuth } from '../hooks/useAuth'

const MOCK_STATS = [
  { label: 'Quests Done',    value: 12,    icon: Map   },
  { label: 'Species Found',  value: 34,    icon: Leaf  },
  { label: 'Eco Commutes',   value: 9,     icon: Zap   },
  { label: 'Badges Earned',  value: 5,     icon: Award },
]

const MOCK_BADGES = [
  { emoji: '🦋', label: 'Butterfly Scout'  },
  { emoji: '🦆', label: 'Duck Watcher'     },
  { emoji: '🌿', label: 'Plant Identifier' },
  { emoji: '🚲', label: 'Eco Commuter'     },
  { emoji: '⭐', label: 'First Quest'      },
]

export default function Profile() {
  const { logout } = useAuth()
  const user = JSON.parse(localStorage.getItem('ecoquest_user') || '{}')

  return (
    <div className="page-scroll px-4 pt-6 pb-4">

      {/* Avatar + name */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-6"
      >
        <div className="w-16 h-16 rounded-full bg-forest-700 border-2 border-forest-600 flex items-center justify-center text-3xl">
          🧑
        </div>
        <div className="flex-1">
          <h1 className="font-display text-xl font-bold text-forest-300">{user.name || 'EcoQuester'}</h1>
          <p className="text-xs text-forest-500 font-body">San Diego, CA 🌊</p>
          <div className="mt-2">
            <XPBar current={user.xp || 1240} max={2000} level={user.level || 4} />
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {MOCK_STATS.map(({ label, value, icon: Icon }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="card flex flex-col items-center py-4 gap-1"
          >
            <Icon size={18} className="text-forest-500" />
            <span className="font-display text-2xl font-bold text-forest-300">{value}</span>
            <span className="text-xs text-forest-500 font-body text-center">{label}</span>
          </motion.div>
        ))}
      </div>

      {/* Badges */}
      <h2 className="font-display text-sm text-forest-400 mb-3">Badges</h2>
      <div className="flex flex-wrap gap-2 mb-8">
        {MOCK_BADGES.map((b, i) => (
          <motion.div
            key={b.label}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.06 }}
            className="card flex items-center gap-2 px-3 py-2"
          >
            <span className="text-lg">{b.emoji}</span>
            <span className="text-xs text-forest-400 font-body">{b.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="btn-ghost w-full flex items-center justify-center gap-2 text-red-400 border-red-900"
      >
        <LogOut size={15} /> Sign Out
      </button>
    </div>
  )
}
