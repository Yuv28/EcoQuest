import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Bike, Bus, Car, Footprints, Zap } from 'lucide-react'
import { useGPSLocation } from '../hooks/useLocation'

const detectMode = (speed) => {
  if (speed === null || speed === undefined) return { mode: 'Unknown',  icon: Activity,   color: '#7a9e7a', eco: false }
  const mph = (speed ?? 0) * 2.237
  if (mph < 4)  return { mode: 'Walking', icon: Footprints, color: '#74c874', eco: true  }
  if (mph < 15) return { mode: 'Cycling', icon: Bike,       color: '#74c874', eco: true  }
  if (mph < 35) return { mode: 'Bus / Rail', icon: Bus,     color: '#f5a623', eco: true  }
  return              { mode: 'Driving',  icon: Car,        color: '#ef4444', eco: false }
}

export default function RayBanTracker() {
  const { location, watching, startWatching, stopWatching } = useGPSLocation()
  const [speedLog, setSpeedLog]   = useState([])
  const [ecoPoints, setEcoPoints] = useState(0)
  const prevSpeed = useRef(null)

  useEffect(() => {
    if (!location) return
    const spd = location.speed ?? 0
    setSpeedLog(prev => [...prev.slice(-29), spd])  // keep last 30 readings

    const { eco } = detectMode(spd)
    if (eco && prevSpeed.current !== null) setEcoPoints(p => p + 1)
    prevSpeed.current = spd
  }, [location])

  const transport = detectMode(location?.speed)
  const Icon = transport.icon

  return (
    <div className="page-scroll px-4 pt-6 pb-4">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-2xl font-bold text-forest-300 mb-1"
      >
        Eco Commute Tracker
      </motion.h1>
      <p className="text-xs text-forest-500 font-body mb-6">
        Earn XP for eco-friendly travel during quests
      </p>

      {/* Mode display */}
      <motion.div
        className="card flex flex-col items-center py-8 mb-5 relative overflow-hidden"
        animate={{ borderColor: transport.color + '60' }}
        style={{ borderColor: transport.color + '40' }}
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
          style={{ background: transport.color + '20', border: `2px solid ${transport.color}40` }}
        >
          <Icon size={36} style={{ color: transport.color }} />
        </motion.div>
        <h2 className="font-display text-2xl font-bold" style={{ color: transport.color }}>
          {transport.mode}
        </h2>
        {location && (
          <p className="text-xs font-mono text-forest-500 mt-1">
            {((location.speed ?? 0) * 2.237).toFixed(1)} mph
          </p>
        )}
        {transport.eco && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mt-3 text-xs font-mono px-3 py-1 rounded-full"
            style={{ background: transport.color + '20', color: transport.color, border: `1px solid ${transport.color}40` }}
          >
            ✅ Eco-friendly — XP earning
          </motion.span>
        )}
      </motion.div>

      {/* Eco points */}
      <div className="card flex items-center justify-between mb-5">
        <div>
          <p className="text-xs text-forest-500 font-body">Eco Points This Journey</p>
          <p className="font-display text-3xl font-bold text-forest-300 mt-0.5">{ecoPoints}</p>
        </div>
        <div className="w-12 h-12 rounded-full flex items-center justify-center"
             style={{ background: 'var(--accent-amber)20', border: '1px solid var(--accent-amber)40' }}>
          <Zap size={22} style={{ color: 'var(--accent-amber)' }} />
        </div>
      </div>

      {/* Speed chart — simple bars */}
      {speedLog.length > 1 && (
        <div className="card mb-5">
          <p className="text-xs text-forest-500 font-body mb-3">Speed History</p>
          <div className="flex items-end gap-0.5 h-12">
            {speedLog.map((s, i) => {
              const pct = Math.min((s * 2.237) / 70 * 100, 100)
              const { color } = detectMode(s)
              return (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(pct, 4)}%` }}
                  className="flex-1 rounded-sm"
                  style={{ background: color + '80' }}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Start / Stop */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={watching ? stopWatching : startWatching}
        className={watching ? 'btn-ghost w-full' : 'btn-primary w-full'}
      >
        {watching ? '⏹ Stop Tracking' : '▶ Start Tracking'}
      </motion.button>

      <p className="text-xs text-center text-forest-600 font-body mt-3">
        Location is only tracked during active quests
      </p>
    </div>
  )
}
