import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bike, Bus, Car, Footprints, Zap, Activity } from 'lucide-react'
import { useGPSLocation } from '../hooks/useLocation'
import { addRewards } from '../services/authService'

const detectMode = (speed) => {
  const mph = (speed ?? 0) * 2.237
  if (mph < 4)  return { mode: 'walking', label: 'Walking',    icon: Footprints, color: '#74c874', eco: true  }
  if (mph < 15) return { mode: 'cycling', label: 'Cycling',    icon: Bike,       color: '#74c874', eco: true  }
  if (mph < 35) return { mode: 'bus',     label: 'Bus / Rail', icon: Bus,        color: '#f5a623', eco: true  }
  return              { mode: 'driving',  label: 'Driving',    icon: Car,        color: '#ef4444', eco: false }
}

// Award eco points every 60 seconds of eco-friendly movement
const REWARD_INTERVAL_MS = 60000
const POINTS_PER_INTERVAL = 10

export default function RayBanTracker() {
  const { location, watching, startWatching, stopWatching } = useGPSLocation()
  const [speedLog, setSpeedLog]     = useState([])
  const [ecoPoints, setEcoPoints]   = useState(0)
  const [lastReward, setLastReward] = useState(null)
  const [rewardMsg, setRewardMsg]   = useState(null)
  const lastRewardTime              = useRef(null)
  const user = JSON.parse(localStorage.getItem('ecoquest_user') || '{}')

  useEffect(() => {
    if (!location) return
    const spd = location.speed ?? 0
    setSpeedLog(prev => [...prev.slice(-29), spd])

    const transport = detectMode(spd)

    // Award points every REWARD_INTERVAL_MS of eco movement
    if (transport.eco) {
      const now = Date.now()
      if (!lastRewardTime.current || now - lastRewardTime.current >= REWARD_INTERVAL_MS) {
        lastRewardTime.current = now
        // ✅ Real API call → POST /rewards/add
        addRewards(user.id, POINTS_PER_INTERVAL, transport.mode)
          .then(res => {
            const { pointsAwarded, multiplier } = res.data
            setEcoPoints(p => p + pointsAwarded)
            setLastReward({ pointsAwarded, multiplier, mode: transport.label })
            setRewardMsg(`+${pointsAwarded} XP (${multiplier}x ${transport.label} bonus!)`)
            setTimeout(() => setRewardMsg(null), 3000)

            // Update local user XP
            const stored = JSON.parse(localStorage.getItem('ecoquest_user') || '{}')
            stored.xp = (stored.xp || 0) + pointsAwarded
            localStorage.setItem('ecoquest_user', JSON.stringify(stored))
          })
          .catch(() => {}) // silent fail — don't interrupt UX
      }
    }
  }, [location])

  const transport = detectMode(location?.speed)
  const Icon = transport.icon

  return (
    <div className="page-scroll px-4 pt-6 pb-4">
      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="font-display text-2xl font-bold text-forest-300 mb-1">
        Eco Commute Tracker
      </motion.h1>
      <p className="text-xs text-forest-500 font-body mb-6">
        Earn real XP for eco-friendly travel during quests
      </p>

      {/* Transport mode card */}
      <motion.div className="card flex flex-col items-center py-8 mb-5"
        animate={{ borderColor: transport.color + '60' }}
        style={{ borderColor: transport.color + '40' }}>
        <motion.div animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
          style={{ background: transport.color + '20', border: `2px solid ${transport.color}40` }}>
          <Icon size={36} style={{ color: transport.color }} />
        </motion.div>
        <h2 className="font-display text-2xl font-bold" style={{ color: transport.color }}>
          {transport.label}
        </h2>
        {location && (
          <p className="text-xs font-mono text-forest-500 mt-1">
            {((location.speed ?? 0) * 2.237).toFixed(1)} mph
          </p>
        )}
        {transport.eco && (
          <span className="mt-3 text-xs font-mono px-3 py-1 rounded-full"
            style={{ background: transport.color + '20', color: transport.color, border: `1px solid ${transport.color}40` }}>
            ✅ Eco-friendly — XP earning active
          </span>
        )}
      </motion.div>

      {/* Reward toast */}
      <AnimatePresence>
        {rewardMsg && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 px-4 py-3 rounded-xl text-sm font-body text-center font-semibold border border-forest-600"
            style={{ background: '#2d5a2d80', color: 'var(--accent-amber)' }}>
            🎉 {rewardMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Points this session */}
      <div className="card flex items-center justify-between mb-5">
        <div>
          <p className="text-xs text-forest-500 font-body">XP Earned This Journey</p>
          <p className="font-display text-3xl font-bold text-forest-300 mt-0.5">{ecoPoints}</p>
          {lastReward && (
            <p className="text-xs text-forest-500 font-body mt-0.5">
              Last: +{lastReward.pointsAwarded} ({lastReward.multiplier}x multiplier)
            </p>
          )}
        </div>
        <div className="w-12 h-12 rounded-full flex items-center justify-center"
             style={{ background: '#f5a62320', border: '1px solid #f5a62340' }}>
          <Zap size={22} style={{ color: 'var(--accent-amber)' }} />
        </div>
      </div>

      {/* Speed history bars */}
      {speedLog.length > 1 && (
        <div className="card mb-5">
          <p className="text-xs text-forest-500 font-body mb-3">Speed History</p>
          <div className="flex items-end gap-0.5 h-12">
            {speedLog.map((s, i) => {
              const pct = Math.min((s * 2.237) / 70 * 100, 100)
              const { color } = detectMode(s)
              return (
                <motion.div key={i} initial={{ height: 0 }}
                  animate={{ height: `${Math.max(pct, 4)}%` }}
                  className="flex-1 rounded-sm" style={{ background: color + '80' }} />
              )
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs font-mono text-forest-600">
            <span>🟢 Walk/Bike</span><span>🟡 Bus</span><span>🔴 Car</span>
          </div>
        </div>
      )}

      {/* Start / Stop */}
      <motion.button whileTap={{ scale: 0.97 }}
        onClick={watching ? stopWatching : startWatching}
        className={watching ? 'btn-ghost w-full' : 'btn-primary w-full'}>
        {watching ? '⏹ Stop Tracking' : '▶ Start Tracking'}
      </motion.button>

      <p className="text-xs text-center text-forest-600 font-body mt-3">
        XP is awarded every 60 seconds of eco-friendly movement
      </p>
    </div>
  )
}
