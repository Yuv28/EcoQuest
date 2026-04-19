import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, CheckCircle, Circle, Camera } from 'lucide-react'
import { getStoredQuests, markQuestComplete } from '../services/questStorage'

export default function QuestDetail() {
  const { questId } = useParams()
  const navigate    = useNavigate()

  // Look up the quest from localStorage by questId
  const allQuests = getStoredQuests()
  const quest     = allQuests.find(q => q.questId === questId)

  const [challenges, setChallenges] = useState(
    quest?.challenges?.map(c => ({ ...c, done: false })) || []
  )

  const toggleChallenge = (id) => {
    setChallenges(prev =>
      prev.map(c => c.id === id ? { ...c, done: !c.done } : c)
    )
  }

  const allDone = challenges.length > 0 && challenges.every(c => c.done)

  // Quest not found
  if (!quest) {
    return (
      <div className="page-scroll flex flex-col items-center justify-center py-20 px-4">
        <p className="text-forest-500 font-body text-sm text-center">
          Quest not found. It may have been completed or removed.
        </p>
        <button onClick={() => navigate('/quests')} className="btn-ghost mt-4">
          ← Back to Quests
        </button>
      </div>
    )
  }

  return (
    <div className="page-scroll pb-4">

      {/* Hero */}
      <div className="relative w-full h-48 bg-forest-700 flex items-center justify-center">
        <span className="text-8xl">{quest.emoji || '🌿'}</span>
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
        <h1 className="font-display text-2xl font-bold text-forest-300">
          {quest.species_target}
        </h1>
        <p className="text-xs text-forest-500 italic font-body mt-0.5">
          {quest.scientific_name}
        </p>

        <div className="flex items-center gap-1 mt-2 text-xs text-forest-500 font-body">
          <MapPin size={11} /> {quest.location}
        </div>

        <p className="text-sm text-forest-400 font-body mt-4 leading-relaxed">
          {quest.description}
        </p>

        {/* Challenges */}
        <h2 className="font-display text-sm text-forest-400 mt-6 mb-3">Challenges</h2>
        <div className="flex flex-col gap-3">
          {challenges.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className="card flex items-start gap-3 cursor-pointer"
              onClick={() => toggleChallenge(c.id)}
            >
              {c.done
                ? <CheckCircle size={18} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-green)' }} />
                : <Circle      size={18} className="text-forest-600 flex-shrink-0 mt-0.5" />
              }
              <span className={`text-sm font-body flex-1 ${c.done ? 'text-forest-500 line-through' : 'text-forest-300'}`}>
                {c.label}
              </span>
              <span className="xp-badge flex-shrink-0">+{c.xp}</span>
            </motion.div>
          ))}
        </div>

        {/* All done — mark complete */}
        {allDone && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              markQuestComplete(questId)
              navigate('/quests')
            }}
            className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
          >
            ✅ Complete Quest
          </motion.button>
        )}

        {/* Photo CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/camera')}
          className="btn-ghost w-full mt-3 flex items-center justify-center gap-2"
        >
          <Camera size={16} /> Take Quest Photo
        </motion.button>

      </div>
    </div>
  )
}