import api from './api'

// ML-powered match recommendation from Lambda
export const findMatches         = (userId)              => api.post('/match/recommend', { userId })
export const getSuggestedMatches = (userId)              => api.get(`/match/suggest?userId=${userId}`)
export const generateGroupQuest  = (userIds, location)  => api.post('/quest/generate-group', { userIds, location })
export const createGroup         = (userIds)             => api.post('/match/group', { userIds })
export const getGroup            = (groupId)             => api.get(`/match/group/${groupId}`)
export const getFriends          = (userId)              => api.get(`/match/friends/${userId}`)
export const inviteFriend        = (userId, friendId)   => api.post('/match/invite', { userId, friendId })
export const verifyQuest         = (questId, friendId)  => api.post(`/match/verify/${questId}`, { friendId })