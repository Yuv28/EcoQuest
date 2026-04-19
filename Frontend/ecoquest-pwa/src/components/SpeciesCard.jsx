import { motion } from 'framer-motion'
import { Shield, MapPin } from 'lucide-react'

const safetyColors = {
  safe:    { label: '✅ Safe',    cls: 'text-green-400 bg-green-400/10 border-green-400/20' },
  caution: { label: '⚠️ Caution', cls: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  avoid:   { label: '❌ Avoid',   cls: 'text-red-400   bg-red-400/10   border-red-400/20'   },
}

export default function SpeciesCard({ species }) {
  const { common_name, scientific_name, imageUrl, safety, location, xp } = species
  const s = safetyColors[safety] || safetyColors.safe

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="card flex flex-col gap-3"
    >
      <div className="relative w-full h-32 rounded-xl overflow-hidden bg-forest-700">
        {imageUrl
          ? <img src={imageUrl} alt={common_name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-4xl">🐾</div>
        }
        <div className="absolute top-2 right-2">
          <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${s.cls}`}>
            {s.label}
          </span>
        </div>
      </div>

      <div>
        <h3 className="font-display font-semibold text-forest-300">{common_name}</h3>
        <p className="text-xs text-forest-500 italic font-body">{scientific_name}</p>
      </div>

      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs text-forest-500">
          <MapPin size={10} /> {location}
        </span>
        <span className="xp-badge">+{xp} XP</span>
      </div>
    </motion.div>
  )
}
