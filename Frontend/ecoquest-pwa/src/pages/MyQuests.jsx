import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { MapPin, ChevronRight, CheckCircle } from 'lucide-react'
import { getStoredQuests, markQuestComplete } from '../services/questStorage'

export default function MyQuests() {
  const [tab, setTab]       = useState('active')
  const [quests, setQuests] = useState([])
  const navigate            = useNavigate()

  // ── Load quests from localStorage every time page is visited ─────────────
  useEffect(() => {
    const stored = getStoredQuests()
    setQuests(stored)
  }, [])

  const activeQuests    = quests.filter(q => !q.completed)
  const completedQuests = quests.filter(q =>  q.completed)
  const displayed       = tab === 'active' ? activeQuests : completedQuests

  const handleComplete = (questId) => {
    markQuestComplete(questId)
    setQuests(getStoredQuests())
  }

  return (
    <div className="page-scroll px-4 pt-6 pb-4">

      <motion.h1
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="font-display text-2xl font-bold text-forest-300 mb-5"
      >
        My Quests
      </motion.h1>

      {/* Tab toggle */}
      <div className="flex bg-forest-800 rounded-xl p-1 mb-5 border border-forest-700">
        {['active', 'completed'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-xs font-body font-semibold capitalize transition-all ${
              tab === t ? 'bg-forest-600 text-forest-300' : 'text-forest-500'
            }`}>
            {t} ({t === 'active' ? activeQuests.length : completedQuests.length})
          </button>
        ))}
      </div>

      {/* Quest list */}
      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {displayed.map((quest, i) => (
            <motion.div
              key={quest.questId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: i * 0.06 }}
              className="card cursor-pointer hover:border-forest-600 transition-colors"
              onClick={() => navigate(`/quests/${quest.questId}`)}
            >
              <div className="flex items-start gap-3">

                {/* Species emoji */}
                <div className="w-12 h-12 rounded-xl bg-forest-700 flex items-center justify-center text-2xl flex-shrink-0">
                  🦋
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-sm font-semibold text-forest-300 truncate">
                      Find a {quest.species_target}
                    </h3>
                    <ChevronRight size={16} className="text-forest-600 flex-shrink-0" />
                  </div>

                  <p className="text-xs text-forest-500 italic font-body mt-0.5">
                    {quest.scientific_name}
                  </p>

                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-forest-500 font-body">
                      <MapPin size={10} /> {quest.location}
                    </span>
                    <span className="xp-badge">+{quest.xp} XP</span>
                    {quest.group && (
                      <span className="text-xs text-forest-600 font-body">
                        👥 {quest.group.length} members
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Challenges preview */}
              {quest.challenges && (
                <div className="mt-3 pt-3 border-t border-forest-700">
                  <p className="text-xs text-forest-500 font-mono mb-2">
                    Challenges ({quest.challenges.length})
                  </p>
                  <div className="flex flex-col gap-1">
                    {quest.challenges.slice(0, 2).map((c, idx) => (
                      <div key={c.id} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border border-forest-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-mono text-forest-500">{idx + 1}</span>
                        </div>
                        <span className="text-xs font-body text-forest-400 truncate">{c.label}</span>
                      </div>
                    ))}
                    {quest.challenges.length > 2 && (
                      <p className="text-xs text-forest-600 font-body ml-6">
                        +{quest.challenges.length - 2} more...
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Mark complete button — only on active tab */}
              {tab === 'active' && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={(e) => {
                    e.stopPropagation() // prevent navigating to quest detail
                    handleComplete(quest.questId)
                  }}
                  className="mt-3 w-full flex items-center justify-center gap-2 text-xs font-body text-forest-400 border border-forest-700 rounded-xl py-2 hover:border-forest-500 transition-colors"
                >
                  <CheckCircle size={13} /> Mark as Complete
                </motion.button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty state */}
        {displayed.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-16 text-forest-600 font-body text-sm"
          >
            {tab === 'active'
              ? <>No active quests yet 🌱<br /><span className="text-xs mt-2 block">Go to Match to find a group quest!</span></>
              : 'No completed quests yet 🏆'
            }
          </motion.div>
        )}
      </div>
    </div>
  )
}