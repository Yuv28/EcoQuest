import api from './api'

// ✅ Live endpoint: POST /quest/create
export const createQuest = (userId, speciesTarget) =>
  api.post('/quest/create', { userId, species_target: speciesTarget })

// Placeholder endpoints — wire when Lambda is ready
export const getMyQuests       = (userId)                     => api.get(`/quests/user/${userId}`)
export const getQuestById      = (questId)                    => api.get(`/quests/${questId}`)
export const completeChallenge = (questId, challengeId, body) => api.post(`/quests/${questId}/challenges/${challengeId}/complete`, body)
export const submitQuestPhoto  = (questId, imageBase64)       => api.post(`/quests/${questId}/photo`, { image: imageBase64 })
