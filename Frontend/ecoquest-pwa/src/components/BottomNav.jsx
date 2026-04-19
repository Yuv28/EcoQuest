import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Leaf, Users, Map, Camera, User } from 'lucide-react'

const tabs = [
  { path: '/',            icon: Leaf,   label: 'Home'     },
  { path: '/matchmaking', icon: Users,  label: 'Match'    },
  { path: '/quests',      icon: Map,    label: 'Quests'   },
  { path: '/camera',      icon: Camera, label: 'Identify' },
  { path: '/profile',     icon: User,   label: 'Profile'  },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  // Hide nav on onboarding
  if (location.pathname === '/onboarding') return null

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-forest-700"
      style={{ background: 'rgba(13,26,13,0.95)', backdropFilter: 'blur(12px)', paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
    >
      <div className="flex justify-around items-center max-w-md mx-auto px-2 pt-2 pb-1">
        {tabs.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path
          return (
            <motion.button
              key={path}
              onClick={() => navigate(path)}
              whileTap={{ scale: 0.8 }}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl relative"
            >
              {active && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-forest-800 rounded-xl"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                size={22}
                className={`relative z-10 transition-colors duration-200 ${active ? 'text-accent-green' : 'text-forest-600'}`}
                style={{ color: active ? 'var(--accent-green)' : 'var(--text-muted)' }}
              />
              <span
                className="relative z-10 text-[10px] font-body font-medium transition-colors duration-200"
                style={{ color: active ? 'var(--accent-green)' : 'var(--text-muted)' }}
              >
                {label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </nav>
  )
}
