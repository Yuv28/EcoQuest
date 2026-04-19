import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Users, Search, UserPlus, Check, MapPin, Zap, X, RefreshCw } from 'lucide-react'
import { findMatches, getSuggestedMatches, generateGroupQuest } from '../services/matchService'
import { saveQuest } from '../services/questStorage'

const AVATARS = ['👩', '🧑', '🧔', '👱', '🧕', '👨', '🧒', '👧']

const MOCK_MATCHES = [
  { user_id: 'mock_001', username: 'Priya',  xp: 980,  score: 0.95, cluster: 1, answers: { nature_interest: 'Birds',       quest_style: 'Small group',   activity_level: 'Often'     } },
  { user_id: 'mock_002', username: 'Jordan', xp: 1560, score: 0.91, cluster: 1, answers: { nature_interest: 'Insects',     quest_style: 'Small group',   activity_level: 'Every day' } },
  { user_id: 'mock_003', username: 'Marcus', xp: 720,  score: 0.87, cluster: 2, answers: { nature_interest: 'Marine life', quest_style: 'Flexible',      activity_level: 'Sometimes' } },
  { user_id: 'mock_004', username: 'Elena',  xp: 1200, score: 0.83, cluster: 1, answers: { nature_interest: 'Birds',       quest_style: 'Small group',   activity_level: 'Often'     } },
  { user_id: 'mock_005', username: 'Felix',  xp: 430,  score: 0.78, cluster: 3, answers: { nature_interest: 'Plants',      quest_style: 'Solo explorer', activity_level: 'Rarely'    } },
]

const MOCK_FRIENDS = [
  { user_id: 'friend_001', username: 'Aisha', xp: 2100, answers: { nature_interest: 'Birds',       quest_style: 'Small group', activity_level: 'Every day' } },
  { user_id: 'friend_002', username: 'Diego', xp: 870,  answers: { nature_interest: 'Marine life', quest_style: 'Flexible',    activity_level: 'Often'     } },
  { user_id: 'friend_003', username: 'Yuki',  xp: 1340, answers: { nature_interest: 'Plants',      quest_style: 'Small group', activity_level: 'Sometimes' } },
]

const MOCK_QUESTS = [
  {
    questId:         'quest_mock_001',
    species_target:  'Monarch Butterfly',
    scientific_name: 'Danaus plexippus',
    location:        'Balboa Park, San Diego',
    description:     'Head to the milkweed patches near the Natural History Museum in Balboa Park. Monarch butterflies are currently migrating through San Diego — keep your eyes on the flowering plants!',
    challenges: [
      { id: 'c1', label: 'Get there eco-friendly (walk, bike, or bus)',  xp: 50 },
      { id: 'c2', label: 'Find the Monarch and observe for 2 minutes',   xp: 75 },
      { id: 'c3', label: 'Place a small orange slice near the butterfly', xp: 50 },
      { id: 'c4', label: 'Take a photo and submit to iNaturalist',        xp: 25 },
    ],
    xp: 200, emoji: '🦋',
  },
  {
    questId:         'quest_mock_002',
    species_target:  'Great Blue Heron',
    scientific_name: 'Ardea herodias',
    location:        'San Elijo Lagoon, Encinitas',
    description:     "San Elijo Lagoon is one of the best spots in San Diego to observe Great Blue Herons hunting along the water's edge. Arrive early morning for the best sighting chances.",
    challenges: [
      { id: 'c1', label: 'Get there eco-friendly (walk, bike, or bus)',         xp: 50 },
      { id: 'c2', label: 'Spot the heron standing still in the water',           xp: 75 },
      { id: 'c3', label: 'Observe it hunting for 3 minutes without disturbing',  xp: 60 },
      { id: 'c4', label: 'Take a photo and submit to iNaturalist',               xp: 25 },
    ],
    xp: 210, emoji: '🦤',
  },
  {
    questId:         'quest_mock_003',
    species_target:  'Bufflehead Duck',
    scientific_name: 'Bucephala albeola',
    location:        'Mission Bay, San Diego',
    description:     'Mission Bay is a winter hotspot for Bufflehead ducks. Look for their distinctive black-and-white iridescent heads bobbing on the water near the eastern shore.',
    challenges: [
      { id: 'c1', label: 'Get there eco-friendly (walk, bike, or bus)',   xp: 50 },
      { id: 'c2', label: 'Spot a Bufflehead and identify it by its head', xp: 75 },
      { id: 'c3', label: 'Toss a small piece of bread near the water',    xp: 50 },
      { id: 'c4', label: 'Take a photo and submit to iNaturalist',        xp: 25 },
    ],
    xp: 200, emoji: '🦆',
  },
  {
    questId:         'quest_mock_004',
    species_target:  'Ochre Sea Star',
    scientific_name: 'Pisaster ochraceus',
    location:        'La Jolla Cove Tide Pools',
    description:     'Head to the tide pools at La Jolla Cove during low tide to search for Ochre Sea Stars. These iconic orange and purple stars are making a comeback after sea star wasting disease.',
    challenges: [
      { id: 'c1', label: 'Get there eco-friendly (walk, bike, or bus)',        xp: 50 },
      { id: 'c2', label: 'Find a sea star in the tide pools',                   xp: 80 },
      { id: 'c3', label: 'Observe without touching — note its colour pattern',  xp: 45 },
      { id: 'c4', label: 'Take a photo and submit to iNaturalist',              xp: 25 },
    ],
    xp: 200, emoji: '⭐',
  },
  {
    questId:         'quest_mock_005',
    species_target:  'Western Burrowing Owl',
    scientific_name: 'Athene cunicularia hypugaea',
    location:        'Otay Mesa Grasslands, San Diego',
    description:     'The Western Burrowing Owl is critically endangered in San Diego. Head to the open grasslands of Otay Mesa at dusk and look for small owls perched at ground level near their burrows.',
    challenges: [
      { id: 'c1', label: 'Get there eco-friendly (walk, bike, or bus)',    xp: 50 },
      { id: 'c2', label: 'Spot a burrowing owl at its burrow entrance',    xp: 90 },
      { id: 'c3', label: 'Log the time of day and behaviour you observed', xp: 40 },
      { id: 'c4', label: 'Take a photo and submit to iNaturalist',         xp: 25 },
    ],
    xp: 205, emoji: '🦉',
  },
  {
    questId:         'quest_mock_006',
    species_target:  'Brown Pelican',
    scientific_name: 'Pelecanus occidentalis',
    location:        'Ocean Beach Pier, San Diego',
    description:     'Brown Pelicans are a conservation success story — once nearly extinct from DDT, they now thrive along the San Diego coast. Head to Ocean Beach Pier to watch them dive for fish.',
    challenges: [
      { id: 'c1', label: 'Get there eco-friendly (walk, bike, or bus)',      xp: 50 },
      { id: 'c2', label: 'Watch a pelican make a plunge dive for fish',      xp: 75 },
      { id: 'c3', label: 'Count how many pelicans are roosting on the pier', xp: 50 },
      { id: 'c4', label: 'Take a photo and submit to iNaturalist',           xp: 25 },
    ],
    xp: 200, emoji: '🐦',
  },
]

const getRandomQuest = () => {
  const quest = MOCK_QUESTS[Math.floor(Math.random() * MOCK_QUESTS.length)]
  return { ...quest, questId: `${quest.questId}_${Date.now()}` }
}

const getFriends = () => {
  const stored = localStorage.getItem('ecoquest_friends')
  return stored ? JSON.parse(stored) : MOCK_FRIENDS
}

const addFriend = (user) => {
  const existing = getFriends()
  const already  = existing.some(f => f.user_id === user.user_id)
  if (already) return false
  localStorage.setItem('ecoquest_friends', JSON.stringify([...existing, user]))
  return true
}

export default function Matchmaking() {
  const [matches,       setMatches]       = useState([])
  const [friends,       setFriends]       = useState([])
  const [invited,       setInvited]       = useState([])
  const [tab,           setTab]           = useState('suggested')
  const [search,        setSearch]        = useState('')
  const [loadingMatch,  setLoadingMatch]  = useState(true)
  const [loadingQuest,  setLoadingQuest]  = useState(false)
  const [quest,         setQuest]         = useState(null)
  const [alreadyExists, setAlreadyExists] = useState(false)
  const [addedFriends,  setAddedFriends]  = useState({})
  const [error,         setError]         = useState(null)
  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem('ecoquest_user') || '{}')

  useEffect(() => {
    if (tab === 'suggested') fetchMatches()
    if (tab === 'friends')   loadFriends()
  }, [tab])

  const fetchMatches = async () => {
    setLoadingMatch(true)
    setInvited([])
    setQuest(null)
    setAlreadyExists(false)
    setError(null)
    try {
      const res         = await findMatches(user.id)
      const recommended = res.data?.recommendedUsers || res.data?.matches || []
      setMatches(recommended.map(m => ({
        user_id:  m.userId  || m.user_id,
        username: m.username,
        xp:       m.xp      || 0,
        score:    m.score   || 0,
        cluster:  m.cluster || null,
        answers:  m.answers || {},
      })))
    } catch {
      try {
        const res = await getSuggestedMatches(user.id)
        setMatches(res.data.matches)
      } catch {
        await new Promise(r => setTimeout(r, 800))
        setMatches(MOCK_MATCHES)
      }
    } finally {
      setLoadingMatch(false)
    }
  }

  const loadFriends = () => {
    setLoadingMatch(true)
    setInvited([])
    setTimeout(() => {
      setFriends(getFriends())
      setLoadingMatch(false)
    }, 400)
  }

  const toggleInvite = (userId) => {
    setInvited(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleAddFriend = (e, match) => {
    e.stopPropagation()
    const wasAdded = addFriend(match)
    if (wasAdded) setAddedFriends(prev => ({ ...prev, [match.user_id]: true }))
  }

  const handleStartQuest = async () => {
    if (invited.length === 0) return
    setLoadingQuest(true)
    setError(null)

    let location = { latitude: 32.7157, longitude: -117.1611 }
    try {
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
      )
      location = { latitude: pos.coords.latitude, longitude: pos.coords.longitude }
    } catch {
      console.warn('Location unavailable — using default San Diego coords')
    }

    try {
      const res = await generateGroupQuest([user.id, ...invited], location)
      setQuest(res.data)
    } catch {
      await new Promise(r => setTimeout(r, 1200))
      setQuest(getRandomQuest())
    } finally {
      setLoadingQuest(false)
    }
  }

  // ── Separate function — NOT inside handleLetsGo ───────────────────────────
  const refreshQuest = () => {
    setQuest(getRandomQuest())
    setAlreadyExists(false)
  }

  const handleLetsGo = () => {
    const wasAdded = saveQuest({
      ...quest,
      addedAt:   new Date().toISOString(),
      completed: false,
      group:     [user.id, ...invited],
    })
    setAlreadyExists(!wasAdded)

    const allUsers = tab === 'suggested' ? matches : friends
    invited.forEach(uid => {
      const partner = allUsers.find(m => m.user_id === uid)
      if (partner) addFriend(partner)
    })

    navigate('/quests')
  }

  const getAvatar = (userId) =>
    AVATARS[parseInt(userId.replace(/\D/g, '').slice(-1)) % AVATARS.length] || '🧑'

  const currentList = tab === 'suggested' ? matches : friends
  const filtered    = currentList.filter(m =>
    m.username?.toLowerCase().includes(search.toLowerCase())
  )

  // ── Quest result screen ───────────────────────────────────────────────────
  if (quest) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="page-scroll px-4 pt-6 pb-4"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-forest-500 font-body">Your group quest is ready!</p>
            <h1 className="font-display text-2xl font-bold text-forest-300">🎯 Quest Assigned</h1>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={refreshQuest}
              className="w-8 h-8 rounded-full bg-forest-800 border border-forest-700 flex items-center justify-center"
              title="Try a different quest"
            >
              <RefreshCw size={14} className="text-forest-500" />
            </motion.button>
            <button
              onClick={() => { setQuest(null); setInvited([]) }}
              className="w-8 h-8 rounded-full bg-forest-800 border border-forest-700 flex items-center justify-center"
            >
              <X size={14} className="text-forest-500" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {alreadyExists && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-4 px-4 py-3 rounded-xl text-xs font-body text-amber-300 border border-amber-800 bg-amber-900/30"
            >
              ⚠️ This quest is already in your quests tab
            </motion.div>
          )}
        </AnimatePresence>

        {/* Species card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="card mb-4"
          style={{ background: 'linear-gradient(135deg, #1e3a1e, #2d5a2d)' }}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-forest-700 flex items-center justify-center text-4xl flex-shrink-0">
              {quest.emoji || '🌿'}
            </div>
            <div className="flex-1">
              <h2 className="font-display text-xl font-bold text-forest-300">{quest.species_target}</h2>
              <p className="text-xs text-forest-500 italic font-body">{quest.scientific_name}</p>
              <div className="flex items-center gap-1 mt-1">
                <MapPin size={10} className="text-forest-500" />
                <span className="text-xs text-forest-500 font-body">{quest.location}</span>
              </div>
            </div>
            <span className="xp-badge">+{quest.xp} XP</span>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-sm text-forest-400 font-body leading-relaxed mb-5"
        >
          {quest.description}
        </motion.p>

        {/* Challenges */}
        <h3 className="font-display text-sm text-forest-400 mb-3">Your Challenges</h3>
        <div className="flex flex-col gap-2 mb-6">
          {quest.challenges.map((c, i) => (
            <motion.div key={c.id}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.07 }}
              className="card flex items-center gap-3"
            >
              <div className="w-6 h-6 rounded-full bg-forest-700 border border-forest-600 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-mono text-forest-400">{i + 1}</span>
              </div>
              <span className="text-sm font-body text-forest-300 flex-1">{c.label}</span>
              <span className="xp-badge">+{c.xp}</span>
            </motion.div>
          ))}
        </div>

        {/* Group members */}
        <h3 className="font-display text-sm text-forest-400 mb-3">Your Group</h3>
        <div className="flex gap-2 mb-2">
          {[user.id, ...invited].map((uid) => {
            const allUsers    = tab === 'suggested' ? matches : friends
            const matchedUser = allUsers.find(m => m.user_id === uid)
            const label       = uid === user.id ? (user.username || 'You') : (matchedUser?.username || 'Partner')
            return (
              <div key={uid} className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full bg-forest-700 border-2 border-forest-500 flex items-center justify-center text-lg">
                  {getAvatar(uid)}
                </div>
                <span className="text-xs text-forest-500 font-body">{label}</span>
              </div>
            )
          })}
        </div>

        <p className="text-xs text-forest-600 font-body mb-6">
          🤝 Your quest partners will be added to your friends list automatically
        </p>

        <motion.button whileTap={{ scale: 0.97 }} onClick={handleLetsGo}
          className="btn-primary w-full flex items-center justify-center gap-2">
          <Zap size={16} /> Let's Go!
        </motion.button>
      </motion.div>
    )
  }

  // ── Main matchmaking screen ───────────────────────────────────────────────
  return (
    <div className="page-scroll px-4 pt-6 pb-4">

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-1">
        <h1 className="font-display text-2xl font-bold text-forest-300">Find Partners</h1>
        <motion.button whileTap={{ scale: 0.85 }}
          onClick={tab === 'suggested' ? fetchMatches : loadFriends}
          disabled={loadingMatch}
          className="w-8 h-8 rounded-full bg-forest-800 border border-forest-700 flex items-center justify-center">
          <motion.div animate={loadingMatch ? { rotate: 360 } : {}}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
            <RefreshCw size={14} className="text-forest-500" />
          </motion.div>
        </motion.button>
      </motion.div>
      <p className="text-xs text-forest-500 font-body mb-5">
        Paired with fellow eco explorers like you
      </p>

      {/* Tab toggle */}
      <div className="flex bg-forest-800 rounded-xl p-1 mb-4 border border-forest-700">
        {['suggested', 'friends'].map(t => (
          <button key={t} onClick={() => { setTab(t); setSearch('') }}
            className={`flex-1 py-2 rounded-lg text-xs font-body font-semibold capitalize transition-all ${
              tab === t ? 'bg-forest-600 text-forest-300' : 'text-forest-500'
            }`}>
            {t === 'friends' ? `Friends (${getFriends().length})` : 'Suggested'}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-500" />
        <input
          placeholder={tab === 'suggested' ? 'Search suggestions...' : 'Search friends...'}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-forest-800 border border-forest-700 rounded-xl pl-9 pr-4 py-3 text-sm text-forest-300 font-body outline-none focus:border-forest-500 placeholder:text-forest-600"
        />
      </div>

      {/* Loading skeletons */}
      {loadingMatch && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="card flex items-center gap-3 animate-pulse">
              <div className="w-11 h-11 rounded-full bg-forest-700 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-forest-700 rounded w-1/3" />
                <div className="h-2 bg-forest-700 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!loadingMatch && error && (
        <div className="text-center py-12">
          <p className="text-sm text-red-400 font-body">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!loadingMatch && !error && filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-forest-500 font-body">
            {tab === 'friends'
              ? 'No friends yet — complete a quest with suggested partners to add them!'
              : 'No matches found. Complete your profile to get suggestions!'
            }
          </p>
        </div>
      )}

      {/* Cards */}
      {!loadingMatch && !error && filtered.length > 0 && (
        <div className="flex flex-col gap-3">
          {filtered.map((match, i) => (
            <motion.div key={match.user_id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`card flex items-center gap-3 cursor-pointer transition-colors ${
                invited.includes(match.user_id)
                  ? 'border-forest-500 bg-forest-700/50'
                  : 'hover:border-forest-600'
              }`}
              onClick={() => toggleInvite(match.user_id)}
            >
              <div className="w-11 h-11 rounded-full bg-forest-700 flex items-center justify-center text-2xl flex-shrink-0">
                {getAvatar(match.user_id)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-body font-semibold text-sm text-forest-300">
                    {match.username}
                  </span>
                  <span className="xp-badge">{match.xp} XP</span>
                  {tab === 'suggested' && match.score > 0 && (
                    <span className="text-xs bg-forest-700 text-forest-400 px-2 py-0.5 rounded-full font-body">
                      {Math.round(match.score * 100)}% match
                    </span>
                  )}
                  {tab === 'suggested' && match.cluster !== null && (
                    <span className="text-xs bg-forest-700 text-forest-400 px-2 py-0.5 rounded-full font-body">
                      Cluster {match.cluster}
                    </span>
                  )}
                </div>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {match.answers && Object.entries(match.answers)
                    .slice(0, 3)
                    .map(([key, val]) => (
                      <span key={key}
                        className="text-xs bg-forest-700 text-forest-400 px-2 py-0.5 rounded-full font-body">
                        {val}
                      </span>
                    ))
                  }
                </div>
              </div>

              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <motion.div whileTap={{ scale: 0.85 }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                    invited.includes(match.user_id)
                      ? 'bg-forest-500 border border-forest-400'
                      : 'bg-forest-800 border border-forest-700'
                  }`}
                >
                  {invited.includes(match.user_id)
                    ? <Check size={15} className="text-forest-300" />
                    : <UserPlus size={15} className="text-forest-500" />
                  }
                </motion.div>

                {tab === 'suggested' && (
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={(e) => handleAddFriend(e, match)}
                    className={`text-xs font-body px-2 py-0.5 rounded-full border transition-colors ${
                      addedFriends[match.user_id]
                        ? 'text-forest-400 border-forest-600 bg-forest-700'
                        : 'text-forest-500 border-forest-700 hover:border-forest-500'
                    }`}
                  >
                    {addedFriends[match.user_id] ? '✅ Added' : '+ Friend'}
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Start quest CTA */}
      <AnimatePresence>
        {invited.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-20 left-4 right-4 z-40"
          >
            <motion.button whileTap={{ scale: 0.97 }}
              onClick={handleStartQuest}
              disabled={loadingQuest}
              className="btn-primary w-full flex items-center justify-center gap-2 shadow-lg"
            >
              {loadingQuest ? (
                <>
                  <motion.div animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="text-base">🌿
                  </motion.div>
                  Finding your quest...
                </>
              ) : (
                <>
                  <Users size={16} />
                  Start Quest with {invited.length} partner{invited.length > 1 ? 's' : ''}
                </>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}