// Shared helper to read/write quests from localStorage
// Used by both Matchmaking.jsx and MyQuests.jsx

const QUESTS_KEY = 'ecoquest_active_quests'

export const getStoredQuests = () => {
  const stored = localStorage.getItem(QUESTS_KEY)
  return stored ? JSON.parse(stored) : []
}

export const saveQuest = (quest) => {
  const existing = getStoredQuests()

  // Don't add if quest with same ID already exists
  const alreadyExists = existing.some(q => q.questId === quest.questId)
  if (alreadyExists) return false

  const updated = [quest, ...existing]
  localStorage.setItem(QUESTS_KEY, JSON.stringify(updated))
  return true
}

export const removeQuest = (questId) => {
  const existing = getStoredQuests()
  const updated  = existing.filter(q => q.questId !== questId)
  localStorage.setItem(QUESTS_KEY, JSON.stringify(updated))
}

export const markQuestComplete = (questId) => {
  const existing = getStoredQuests()
  const updated  = existing.map(q =>
    q.questId === questId ? { ...q, completed: true } : q
  )
  localStorage.setItem(QUESTS_KEY, JSON.stringify(updated))
}