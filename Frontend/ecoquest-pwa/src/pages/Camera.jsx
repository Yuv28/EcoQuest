import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera as CameraIcon, RotateCcw, Zap } from 'lucide-react'
import { identifySpecies } from '../services/speciesService'

async function openCamera(onFile) {
  const isIOS     = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isAndroid = /Android/.test(navigator.userAgent)
  const isMobile  = isIOS || isAndroid

  if (isMobile) {
    // Mobile: use native camera via file input
    const input  = document.createElement('input')
    input.type   = 'file'
    input.accept = isIOS ? 'image/*' : 'image/*,android/allowCamera'
    if (isIOS) input.capture = 'environment'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) onFile(file)
    }
    input.click()
  } else {
    // Desktop: use webcam via getUserMedia
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })

      const video      = document.createElement('video')
      video.srcObject  = stream
      video.autoplay   = true

      video.onloadedmetadata = () => {
        video.play()
        setTimeout(() => {
          const canvas  = document.createElement('canvas')
          canvas.width  = video.videoWidth
          canvas.height = video.videoHeight
          canvas.getContext('2d').drawImage(video, 0, 0)

          // Stop the webcam stream
          stream.getTracks().forEach(t => t.stop())

          // Convert to file and pass it along
          canvas.toBlob(blob => {
            const file = new File([blob], 'webcam.jpg', { type: 'image/jpeg' })
            onFile(file)
          }, 'image/jpeg', 0.85)
        }, 500)
      }
    } catch (err) {
      // Webcam not available — fall back to file picker
      const input    = document.createElement('input')
      input.type     = 'file'
      input.accept   = 'image/*'
      input.onchange = (e) => {
        const file = e.target.files[0]
        if (file) onFile(file)
      }
      input.click()
    }
  }
}

export default function Camera() {
  const [preview, setPreview] = useState(null)
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader   = new FileReader()
    reader.onload  = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  const handleCapture = () => {
    openCamera(async (file) => {
      // Show preview immediately
      const reader  = new FileReader()
      reader.onload = (e) => setPreview(e.target.result)
      reader.readAsDataURL(file)

      setLoading(true)
      setError(null)
      try {
        const base64 = await fileToBase64(file)

        // TODO: swap mock for real call when Lambda is ready
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
    })
  }

  const reset = () => {
    setResult(null)
    setPreview(null)
    setError(null)
  }

  return (
    <div className="relative w-full h-screen bg-black flex flex-col">

      {/* Preview or placeholder */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-forest-950">
        {preview ? (
          <img src={preview} className="w-full h-full object-cover" alt="captured" />
        ) : (
          <div className="flex flex-col items-center gap-4 text-forest-700">
            <CameraIcon size={64} strokeWidth={1} />
            <p className="font-body text-sm text-center px-8">
              Tap the button below to open your camera and identify a species
            </p>
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

            {/* Confidence bar */}
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

            <p className="text-xs text-forest-500 font-body leading-relaxed mb-4">
              💡 {result.fun_fact}
            </p>

            <div className="flex gap-3">
              <button onClick={reset} className="btn-ghost flex-1 flex items-center justify-center gap-2">
                <RotateCcw size={14} /> Try Again
              </button>
              <button className="btn-primary flex-1">Submit to iNaturalist</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Capture button */}
      {!result && !loading && (
        <div
          className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-3"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleCapture}
            className="w-16 h-16 rounded-full border-4 border-white/80 bg-white/20 backdrop-blur-sm flex items-center justify-center"
          >
            <CameraIcon size={24} className="text-white" />
          </motion.button>
          <p className="text-xs text-white/50 font-body">Tap to open camera</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute top-16 left-4 right-4 bg-red-900/80 border border-red-700 rounded-xl px-4 py-3 text-xs text-red-300 font-body text-center">
          {error}
        </div>
      )}

    </div>
  )
}