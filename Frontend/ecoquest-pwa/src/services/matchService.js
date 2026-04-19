// src/services/matchService.js
import api from './api'

// ML-powered recommendation from Lambda
export const findMatches     = (userId)            => api.post('/match/recommend', { userId })
export const createGroup     = (userIds)           => api.post('/match/group', { userIds })
export const getGroup        = (groupId)           => api.get(`/match/group/${groupId}`)
export const inviteFriend    = (userId, friendId)  => api.post('/match/invite', { userId, friendId })
export const getFriends      = (userId)            => api.get(`/match/friends/${userId}`)
export const verifyQuest     = (questId, friendId) => api.post(`/match/verify/${questId}`, { friendId })
// export const createGroup     = (userIds)           => api.post('/match/group', { userIds })
// export const getGroup        = (groupId)           => api.get(`/match/group/${groupId}`)
// export const inviteFriend    = (userId, friendId)  => api.post('/match/invite', { userId, friendId })
// export const getFriends      = (userId)            => api.get(`/match/friends/${userId}`)
// export const verifyQuest     = (questId, friendId) => api.post(`/match/verify/${questId}`, { friendId })
