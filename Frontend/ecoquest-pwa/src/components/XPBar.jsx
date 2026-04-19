import { motion } from 'framer-motion'

export default function XPBar({ current, max, level }) {
  const pct = Math.min((current / max) * 100, 100)

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-mono text-forest-400">Level {level}</span>
        <span className="text-xs font-mono text-forest-500">{current} / {max} XP</span>
      </div>
      <div className="h-2 bg-forest-800 rounded-full overflow-hidden border border-forest-700">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #3a7a3a, #74c874)' }}
        />
      </div>
    </div>
  )
}
