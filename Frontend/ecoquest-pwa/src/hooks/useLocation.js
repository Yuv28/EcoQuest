import { useState, useEffect, useCallback } from 'react'

export function useGPSLocation() {
  const [location, setLocation] = useState(null)
  const [error, setError]       = useState(null)
  const [watching, setWatching] = useState(false)
  const [watchId, setWatchId]   = useState(null)

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) { setError('Geolocation not supported'); return }
    const id = navigator.geolocation.watchPosition(
      pos => setLocation({
        latitude:  pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy:  pos.coords.accuracy,
        speed:     pos.coords.speed ?? 0,   // m/s — used for transport mode detection
        timestamp: pos.timestamp,
      }),
      err => setError(err.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    )
    setWatchId(id)
    setWatching(true)
  }, [])

  const stopWatching = useCallback(() => {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId)
    setWatching(false)
  }, [watchId])

  // Get a one-time position
  const getOnce = useCallback(() => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        err => reject(err),
        { enableHighAccuracy: true, timeout: 10000 }
      )
    })
  }, [])

  useEffect(() => () => { if (watchId !== null) navigator.geolocation.clearWatch(watchId) }, [watchId])

  return { location, error, watching, startWatching, stopWatching, getOnce }
}
