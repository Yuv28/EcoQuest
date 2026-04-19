import { motion } from 'framer-motion'
import { MapPin, Star, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function QuestCard({ quest, delay = 0 }) {
  const navigate = useNavigate()
  const { id, title, species, location, xp, difficulty, imageUrl, completed } = quest

  const difficultyColor = {
    easy:   'text-green-400 bg-green-400/10',
    medium: 'text-amber-400 bg-amber-400/10',
    hard:   'text-red-400 bg-red-400/10',
  }[difficulty] || 'text-green-400 bg-green-400/10'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(`/quests/${id}`)}
      className="card flex gap-3 cursor-pointer hover:border-forest-600 transition-colors"
    >
      {/* Species thumbnail */}
      <div className="w-16 h-16 rounded-xl bg-forest-700 flex-shrink-0 overflow-hidden">
        {imageUrl
          ? <img src={imageUrl} alt={species} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-2xl">🌿</div>
        }
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-sm font-semibold text-forest-300 truncate">{title}</h3>
          <ChevronRight size={16} className="text-forest-600 flex-shrink-0 mt-0.5" />
        </div>
        <p className="text-xs text-forest-500 font-body mt-0.5 truncate">{species}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="flex items-center gap-1 text-xs text-forest-500">
            <MapPin size={10} /> {location}
          </span>
          <span className={`text-xs font-mono px-1.5 py-0.5 rounded-md ${difficultyColor}`}>
            {difficulty}
          </span>
          <span className="xp-badge ml-auto">+{xp} XP</span>
        </div>
      </div>
    </motion.div>
  )
}
