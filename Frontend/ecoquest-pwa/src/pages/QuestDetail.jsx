import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, CheckCircle, Circle, Camera } from 'lucide-react'

// Placeholder — replace with real Lambda call using questId
const MOCK_QUEST = {
  id: '1',
  title: 'Monarch Migration Watch',
  species: 'Monarch Butterfly',
  scientific: 'Danaus plexippus',
  location: 'Balboa Park, San Diego',
  lat: 32.7341, lng: -117.1441,
  xp: 200,
  difficulty: 'easy',
  safety: 'safe',
  description: 'Monarch butterflies pass through San Diego during fall migration. Find one resting on milkweed and observe its behavior.',
  challenges: [
    { id: 'c1', label: 'Get there eco-friendly (walk, bike, or bus)', xp: 50,  done: false },
    { id: 'c2', label: 'Find the species and observe for 2 minutes',  xp: 75,  done: false },
    { id: 'c3', label: 'Place a small piece of orange near it',       xp: 50,  done: false },
    { id: 'c4', label: 'Take a photo and submit to iNaturalist',      xp: 25,  done: false },
  ]
}

export default function QuestDetail() {
  const { questId } = useParams()
  const navigate    = useNavigate()
  const quest       = MOCK_QUEST // TODO: fetch by questId

  return (
    <div className="page-scroll pb-4">

      {/* Hero */}
      <div className="relative w-full h-48 bg-forest-700 flex items-center justify-center">
        <span className="text-8xl">🦋</span>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-forest-950" />

        {/* Back button */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
        >
          <ArrowLeft size={18} className="text-forest-300" />
        </motion.button>

        {/* XP badge */}
        <div className="absolute top-4 right-4 xp-badge">+{quest.xp} XP</div>
      </div>

      <div className="px-4 pt-4">
        {/* Title */}
        <h1 className="font-display text-2xl font-bold text-forest-300">{quest.title}</h1>
        <p className="text-xs text-forest-500 italic font-body mt-0.5">{quest.scientific}</p>

        <div className="flex items-center gap-1 mt-2 text-xs text-forest-500 font-body">
          <MapPin size={11} /> {quest.location}
        </div>

        <p className="text-sm text-forest-400 font-body mt-4 leading-relaxed">{quest.description}</p>

        {/* Challenges */}
        <h2 className="font-display text-sm text-forest-400 mt-6 mb-3">Challenges</h2>
        <div className="flex flex-col gap-3">
          {quest.challenges.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className="card flex items-start gap-3"
            >
              {c.done
                ? <CheckCircle size={18} className="text-forest-400 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-green)' }} />
                : <Circle      size={18} className="text-forest-600 flex-shrink-0 mt-0.5" />
              }
              <span className={`text-sm font-body flex-1 ${c.done ? 'text-forest-500 line-through' : 'text-forest-300'}`}>
                {c.label}
              </span>
              <span className="xp-badge flex-shrink-0">+{c.xp}</span>
            </motion.div>
          ))}
        </div>

        {/* Photo submit CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/camera')}
          className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
        >
          <Camera size={16} /> Take Quest Photo
        </motion.button>
      </div>
    </div>
  )
}
