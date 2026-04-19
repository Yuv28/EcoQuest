import { useState } from 'react'
import { motion } from 'framer-motion'
import QuestCard from '../components/QuestCard'

const MOCK_ACTIVE = [
  { id: '1', title: 'Monarch Migration Watch', species: 'Monarch Butterfly', location: 'Balboa Park',     xp: 200, difficulty: 'easy',   imageUrl: null },
  { id: '2', title: 'Bufflehead Duck Spotting', species: 'Bufflehead Duck',  location: 'Mission Bay',     xp: 350, difficulty: 'medium', imageUrl: null },
]
const MOCK_COMPLETED = [
  { id: '3', title: 'Great Blue Heron Feeding', species: 'Great Blue Heron', location: 'San Elijo Lagoon', xp: 150, difficulty: 'easy', imageUrl: null },
]

export default function MyQuests() {
  const [tab, setTab] = useState('active')

  const quests = tab === 'active' ? MOCK_ACTIVE : MOCK_COMPLETED

  return (
    <div className="page-scroll px-4 pt-6 pb-4">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-2xl font-bold text-forest-300 mb-5"
      >
        My Quests
      </motion.h1>

      {/* Tab toggle */}
      <div className="flex bg-forest-800 rounded-xl p-1 mb-5 border border-forest-700">
        {['active', 'completed'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-xs font-body font-semibold capitalize transition-all ${
              tab === t ? 'bg-forest-600 text-forest-300' : 'text-forest-500'
            }`}
          >
            {t} {t === 'active' ? `(${MOCK_ACTIVE.length})` : `(${MOCK_COMPLETED.length})`}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {quests.map((q, i) => (
          <QuestCard key={q.id} quest={q} delay={i * 0.08} />
        ))}
        {quests.length === 0 && (
          <div className="text-center py-16 text-forest-600 font-body text-sm">
            No {tab} quests yet 🌱
          </div>
        )}
      </div>
    </div>
  )
}
