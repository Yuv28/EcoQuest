import api from './api'

// ✅ Live endpoint: POST /register
export const register = (username, interests) =>
  api.post('/register', { username, interests })

// ✅ Live endpoint: POST /rewards/add
export const addRewards = (userId, points, movementType) =>
  api.post('/rewards/add', { userId, points, movement_type: movementType })
