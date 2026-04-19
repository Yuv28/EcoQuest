import api from './api'

// Location Processor Lambda
export const logMovement      = (userId, coords, speed) => api.post('/location/log', { userId, coords, speed })
export const getTransportMode = (speedHistory)          => api.post('/location/mode', { speedHistory })
export const verifyEcoCommute = (questId, userId)       => api.post(`/location/verify-commute/${questId}`, { userId })
