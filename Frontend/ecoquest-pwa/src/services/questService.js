import api from './api'

// Quest Engine Lambda
export const generateQuest    = (payload)                    => api.post('/quests/generate', payload)
export const getMyQuests      = (userId)                     => api.get(`/quests/user/${userId}`)
export const getQuestById     = (questId)                    => api.get(`/quests/${questId}`)
export const completeChallenge = (questId, challengeId, body) => api.post(`/quests/${questId}/challenges/${challengeId}/complete`, body)
export const submitQuestPhoto = (questId, imageBase64)       => api.post(`/quests/${questId}/photo`, { image: imageBase64 })
