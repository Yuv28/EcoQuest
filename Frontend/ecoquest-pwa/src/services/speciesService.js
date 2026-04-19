import api from './api'

// Species Info Lambda + Amazon Rekognition
export const identifySpecies  = (imageBase64) => api.post('/species/identify', { image: imageBase64 })
export const getSpeciesInfo   = (taxonId)     => api.get(`/species/${taxonId}`)
export const getNearbySpecies = (lat, lng)    => api.get('/species/nearby', { params: { lat, lng } })
