import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera as CameraIcon, X, Zap, RotateCcw } from 'lucide-react'
import { useCamera } from '../hooks/useCamera'
import { identifySpecies } from '../services/speciesService'

export default function Camera() {
  const { videoRef, capturing, startCamera, capturePhoto, stopCamera } = useCamera()
  const [result,   setResult]   = useState(null)  // species ID result
  const [loading,  setLoading]  = useState(false)
  const [preview,  setPreview]  = useState(null)  // base64 preview image
  const [error,    setError]    = useState(null)

  useEffect(() => {
    startCamera().catch(e => setError('Camera access denied. Please allow camera permissions.'))
    return () => stopCamera()
  }, [])

  const handleCapture = async () => {
    const base64 = capturePhoto()
    if (!base64) return
    setPreview(`data:image/jpeg;base64,${base64}`)
    stopCamera()
    setLoading(true)
    try {
      // TODO: wire to real Rekognition Lambda endpoint
      // const res = await identifySpecies(base64)
      // setResult(res.data)

      // MOCK result for demo
      await new Promise(r => setTimeout(r, 1500))
      setResult({
        common_name:     'Monarch Butterfly',
        scientific_name: 'Danaus plexippus',
        confidence:      94,
        safety:          'safe',
        xp_earned:       200,
        fun_fact:        'Monarchs migrate up to 3,000 miles each year to reach their wintering grounds.',
      })
    } catch (e) {
      setError('Identification failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setResult(null)
    setPreview(null)
    setError(null)
    startCamera()
  }

  return (
    <div className="relative w-full h-screen bg-black flex flex-col">

      {/* Camera viewfinder or preview */}
      <div className="flex-1 relative overflow-hidden">
        {preview
          ? <img src={preview} className="w-full h-full object-cover" alt="captured" />
          : <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        }

        {/* Targeting reticle */}
        {!preview && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-56 h-56 border-2 border-forest-400/60 rounded-2xl relative">
              {['tl','tr','bl','br'].map(c => (
                <div key={c} className={`absolute w-5 h-5 border-forest-400
                  ${c==='tl' ? 'top-0 left-0  border-t-2 border-l-2 rounded-tl-lg' : ''}
                  ${c==='tr' ? 'top-0 right-0 border-t-2 border-r-2 rounded-tr-lg' : ''}
                  ${c==='bl' ? 'bottom-0 left-0  border-b-2 border-l-2 rounded-bl-lg' : ''}
                  ${c==='br' ? 'bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg' : ''}
                `} />
              ))}
            </div>
          </div>
        )}

        {/* Loading overlay */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              >
                <Zap size={32} style={{ color: 'var(--accent-amber)' }} />
              </motion.div>
              <p className="font-body text-sm text-forest-300">Identifying species...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Result card */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute bottom-0 left-0 right-0 bg-forest-900 border-t border-forest-700 rounded-t-3xl p-6"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 24px)' }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="font-display text-xl font-bold text-forest-300">{result.common_name}</h2>
                <p className="text-xs text-forest-500 italic font-body">{result.scientific_name}</p>
              </div>
              <span className="xp-badge">+{result.xp_earned} XP</span>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-1.5 bg-forest-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${result.confidence}%` }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="h-full rounded-full bg-forest-500"
                />
              </div>
              <span className="text-xs font-mono text-forest-400">{result.confidence}% match</span>
            </div>

            <p className="text-xs text-forest-500 font-body leading-relaxed mb-4">💡 {result.fun_fact}</p>

            <div className="flex gap-3">
              <button onClick={reset} className="btn-ghost flex-1 flex items-center justify-center gap-2">
                <RotateCcw size={14} /> Try Again
              </button>
              <button className="btn-primary flex-1">Submit to iNaturalist</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Capture button — only when camera is live */}
      {!result && !loading && (
        <div className="absolute bottom-10 left-0 right-0 flex justify-center"
             style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleCapture}
            className="w-16 h-16 rounded-full border-4 border-white/80 bg-white/20 backdrop-blur-sm flex items-center justify-center"
          >
            <CameraIcon size={24} className="text-white" />
          </motion.button>
        </div>
      )}

      {error && (
        <div className="absolute top-16 left-4 right-4 bg-red-900/80 border border-red-700 rounded-xl px-4 py-3 text-xs text-red-300 font-body text-center">
          {error}
        </div>
      )}
    </div>
  )
}
