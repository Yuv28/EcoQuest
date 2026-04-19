import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera as CameraIcon, RotateCcw, Zap, X, MapPin, Utensils, BookOpen, Star } from 'lucide-react'

const API_BASE = 'https://xdg48s4j3h.execute-api.us-east-2.amazonaws.com/dev'

async function openCamera(onFile) {
  const isIOS     = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isAndroid = /Android/.test(navigator.userAgent)
  const isMobile  = isIOS || isAndroid

  if (isMobile) {
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
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
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
          stream.getTracks().forEach(t => t.stop())
          canvas.toBlob(blob => {
            const file = new File([blob], 'webcam.jpg', { type: 'image/jpeg' })
            onFile(file)
          }, 'image/jpeg', 0.85)
        }, 500)
      }
    } catch (err) {
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
  const [preview,     setPreview]     = useState(null)
  const [result,      setResult]      = useState(null)   // identification result
  const [speciesInfo, setSpeciesInfo] = useState(null)   // iNaturalist facts
  const [loading,     setLoading]     = useState(false)
  const [loadingInfo, setLoadingInfo] = useState(false)
  const [error,       setError]       = useState(null)

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
      setResult(null)
      setSpeciesInfo(null)

      try {
        const base64 = await fileToBase64(file)

        // ── Step 1: Identify the species ──────────────────────────────────
        let identified
        try {
          const res = await fetch(`${API_BASE}/species/identify`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ image: base64 }),
          })
          identified = await res.json()
        } catch (err) {
          // Backend not ready — use mock
          await new Promise(r => setTimeout(r, 1500))
          identified = {
            common_name:     'Monarch Butterfly',
            scientific_name: 'Danaus plexippus',
            confidence:      94,
            taxon_id:        48662,
          }
        }

        setResult(identified)
        setLoading(false)

        // ── Step 2: Fetch iNaturalist facts using taxon_id ────────────────
        if (identified.taxon_id) {
          setLoadingInfo(true)
          try {
            const infoRes = await fetch(`${API_BASE}/species/info?taxon_id=${identified.taxon_id}`)
            const info    = await infoRes.json()
            setSpeciesInfo(info)
          } catch (err) {
            // Backend not ready — use mock facts
            setSpeciesInfo({
              description: 'A large, striking butterfly known for its orange and black wings with white spots along the edges.',
              habitat:     'Open fields, meadows, roadsides, and gardens with milkweed plants',
              diet:        'Adults drink nectar from flowers. Caterpillars eat exclusively milkweed leaves.',
              where_found: 'North America, migrating annually to central Mexico and coastal California for winter',
              fun_fact:    'Monarchs navigate using a time-compensated sun compass and can travel up to 100 miles per day during migration.',
              wikipedia_url: 'https://en.wikipedia.org/wiki/Monarch_butterfly',
            })
          } finally {
            setLoadingInfo(false)
          }
        }

      } catch (e) {
        setError('Identification failed. Try again.')
        setLoading(false)
      }
    })
  }

  const reset = () => {
    setResult(null)
    setSpeciesInfo(null)
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
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3"
            >
              <motion.div animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                <Zap size={32} style={{ color: 'var(--accent-amber)' }} />
              </motion.div>
              <p className="font-body text-sm text-forest-300">Identifying species...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Result + Facts Sheet — stays on screen until user closes it ── */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute bottom-0 left-0 right-0 bg-forest-900 border-t border-forest-700 rounded-t-3xl"
            style={{
              maxHeight: '80vh',
              paddingBottom: 'env(safe-area-inset-bottom, 24px)',
            }}
          >
            {/* Scrollable content */}
            <div className="overflow-y-auto" style={{ maxHeight: '80vh' }}>
              <div className="p-6">

                {/* Close + XP header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="font-display text-xl font-bold text-forest-300">
                      {result.common_name}
                    </h2>
                    <p className="text-xs text-forest-500 italic font-body">
                      {result.scientific_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="xp-badge">+200 XP</span>
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={reset}
                      className="w-7 h-7 rounded-full bg-forest-800 border border-forest-700 flex items-center justify-center"
                    >
                      <X size={14} className="text-forest-400" />
                    </motion.button>
                  </div>
                </div>

                {/* Confidence bar */}
                <div className="flex items-center gap-2 mb-5">
                  <div className="flex-1 h-1.5 bg-forest-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.confidence}%` }}
                      transition={{ delay: 0.2, duration: 0.8 }}
                      className="h-full rounded-full bg-forest-500"
                    />
                  </div>
                  <span className="text-xs font-mono text-forest-400">
                    {result.confidence}% match
                  </span>
                </div>

                {/* iNaturalist facts */}
                {loadingInfo ? (
                  <div className="flex items-center gap-2 py-4">
                    <motion.div animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className="text-lg">🌿
                    </motion.div>
                    <p className="text-xs text-forest-500 font-body">
                      Loading species info...
                    </p>
                  </div>
                ) : speciesInfo && (
                  <div className="flex flex-col gap-4">

                    {/* Description */}
                    {speciesInfo.description && (
                      <div className="flex gap-3">
                        <BookOpen size={15} className="text-forest-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-mono text-forest-500 mb-1">About</p>
                          <p className="text-sm font-body text-forest-300 leading-relaxed">
                            {speciesInfo.description}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Where found */}
                    {speciesInfo.where_found && (
                      <div className="flex gap-3">
                        <MapPin size={15} className="text-forest-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-mono text-forest-500 mb-1">Where Found</p>
                          <p className="text-sm font-body text-forest-300 leading-relaxed">
                            {speciesInfo.where_found}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Diet */}
                    {speciesInfo.diet && (
                      <div className="flex gap-3">
                        <Utensils size={15} className="text-forest-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-mono text-forest-500 mb-1">Diet</p>
                          <p className="text-sm font-body text-forest-300 leading-relaxed">
                            {speciesInfo.diet}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Habitat */}
                    {speciesInfo.habitat && (
                      <div className="flex gap-3">
                        <span className="text-sm flex-shrink-0 mt-0.5">🌿</span>
                        <div>
                          <p className="text-xs font-mono text-forest-500 mb-1">Habitat</p>
                          <p className="text-sm font-body text-forest-300 leading-relaxed">
                            {speciesInfo.habitat}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Fun fact */}
                    {speciesInfo.fun_fact && (
                      <div className="flex gap-3">
                        <Star size={15} className="text-forest-500 flex-shrink-0 mt-0.5"
                          style={{ color: 'var(--accent-amber)' }} />
                        <div>
                          <p className="text-xs font-mono text-forest-500 mb-1">Fun Fact</p>
                          <p className="text-sm font-body text-forest-300 leading-relaxed">
                            {speciesInfo.fun_fact}
                          </p>
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={reset}
                    className="btn-ghost flex-1 flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={14} /> Try Again
                  </button>
                  <button className="btn-primary flex-1">
                    Submit to iNaturalist
                  </button>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Capture button — only when no result showing */}
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