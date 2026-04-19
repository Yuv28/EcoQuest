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
      const video     = document.createElement('video')
      video.srcObject = stream
      video.autoplay  = true
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

// Opens photo library only — no camera — for Ray-Ban glasses photos
function openGlassesPhoto(onFile) {
  const input    = document.createElement('input')
  input.type     = 'file'
  input.accept   = 'image/*'
  // No capture attribute — forces photo library, not camera
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) onFile(file)
  }
  input.click()
}

// ── Screen 1: Camera / placeholder ───────────────────────────────────────────
function CameraScreen({ onCapture, onGlassesPhoto, loading }) {
  return (
    <div className="relative w-full h-screen bg-black flex flex-col">
      <div className="flex-1 flex items-center justify-center bg-forest-950">
        <div className="flex flex-col items-center gap-4 text-forest-700">
          <CameraIcon size={64} strokeWidth={1} />
          <p className="font-body text-sm text-center px-8">
            Tap the button below to open your camera and identify a species
          </p>
        </div>
      </div>

      {/* Loading overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-3"
          >
            <motion.div animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
              <Zap size={36} style={{ color: 'var(--accent-amber)' }} />
            </motion.div>
            <p className="font-body text-sm text-forest-300">Identifying species...</p>
            <p className="font-body text-xs text-forest-500">This may take a moment</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Capture buttons */}
      {!loading && (
        <div
  className="absolute left-0 right-0 flex flex-col items-center gap-3"
  style={{ bottom: 'calc(72px + env(safe-area-inset-bottom, 0px))', paddingBottom: '16px' }}
>
          {/* Phone camera button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onCapture}
            className="w-16 h-16 rounded-full border-4 border-white/80 bg-white/20 backdrop-blur-sm flex items-center justify-center"
          >
            <CameraIcon size={24} className="text-white" />
          </motion.button>
          <p className="text-xs text-white/50 font-body">Tap to open camera</p>

          {/* Ray-Ban glasses photo button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onGlassesPhoto}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mt-1"
          >
            <span className="text-base">🕶️</span>
            <span className="text-xs text-white/70 font-body">Use Ray-Ban Photo</span>
          </motion.button>
        </div>
      )}
    </div>
  )
}

// ── Screen 2: Result — image + facts ─────────────────────────────────────────
function ResultScreen({ preview, result, speciesInfo, loadingInfo, onReset }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-forest-950"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Photo — top 40% */}
      <div className="relative flex-shrink-0" style={{ height: '40vh' }}>
        <img
          src={preview}
          className="w-full h-full object-cover"
          alt="captured species"
        />
        <div className="absolute bottom-0 left-0 right-0 h-16"
             style={{ background: 'linear-gradient(to bottom, transparent, #0d1a0d)' }} />

        {/* Close button */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={onReset}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center"
        >
          <X size={16} className="text-white" />
        </motion.button>

        {/* Confidence bar over photo */}
        <div className="absolute bottom-5 left-4 right-4 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${result.confidence}%` }}
              transition={{ delay: 0.3, duration: 1 }}
              className="h-full rounded-full bg-forest-400"
            />
          </div>
          <span className="text-xs font-mono text-white/70">
            {result.confidence}% match
          </span>
        </div>
      </div>

      {/* Facts — scrollable bottom 60% */}
      <div className="flex-1 overflow-y-auto bg-forest-950">
        <div className="px-5 pt-4 pb-6">

          {/* Species name + XP */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-forest-300">
                {result.common_name}
              </h2>
              <p className="text-xs text-forest-500 italic font-body mt-0.5">
                {result.scientific_name}
              </p>
            </div>
            <span className="xp-badge mt-1">+200 XP</span>
          </div>

          {/* Facts */}
          {loadingInfo ? (
            <div className="flex items-center gap-3 py-6">
              <motion.div animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="text-xl">🌿
              </motion.div>
              <p className="text-sm text-forest-500 font-body">
                Loading species facts from iNaturalist...
              </p>
            </div>
          ) : speciesInfo ? (
            <div className="flex flex-col gap-5">

              {speciesInfo.description && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }} className="flex gap-3"
                >
                  <BookOpen size={16} className="text-forest-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-mono text-forest-500 mb-1 uppercase tracking-wide">About</p>
                    <p className="text-sm font-body text-forest-300 leading-relaxed">{speciesInfo.description}</p>
                  </div>
                </motion.div>
              )}

              {speciesInfo.where_found && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }} className="flex gap-3"
                >
                  <MapPin size={16} className="text-forest-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-mono text-forest-500 mb-1 uppercase tracking-wide">Where Found</p>
                    <p className="text-sm font-body text-forest-300 leading-relaxed">{speciesInfo.where_found}</p>
                  </div>
                </motion.div>
              )}

              {speciesInfo.diet && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }} className="flex gap-3"
                >
                  <Utensils size={16} className="text-forest-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-mono text-forest-500 mb-1 uppercase tracking-wide">Diet</p>
                    <p className="text-sm font-body text-forest-300 leading-relaxed">{speciesInfo.diet}</p>
                  </div>
                </motion.div>
              )}

              {speciesInfo.habitat && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }} className="flex gap-3"
                >
                  <span className="text-base flex-shrink-0 mt-0.5">🌿</span>
                  <div>
                    <p className="text-xs font-mono text-forest-500 mb-1 uppercase tracking-wide">Habitat</p>
                    <p className="text-sm font-body text-forest-300 leading-relaxed">{speciesInfo.habitat}</p>
                  </div>
                </motion.div>
              )}

              {speciesInfo.fun_fact && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }} className="flex gap-3"
                >
                  <Star size={16} className="flex-shrink-0 mt-0.5"
                    style={{ color: 'var(--accent-amber)' }} />
                  <div>
                    <p className="text-xs font-mono text-forest-500 mb-1 uppercase tracking-wide">Fun Fact</p>
                    <p className="text-sm font-body text-forest-300 leading-relaxed">{speciesInfo.fun_fact}</p>
                  </div>
                </motion.div>
              )}

            </div>
          ) : null}

          {/* Action buttons */}
          <div className="flex gap-3 mt-6">
            <button onClick={onReset}
              className="btn-ghost flex-1 flex items-center justify-center gap-2">
              <RotateCcw size={14} /> Try Again
            </button>
            <button className="btn-primary flex-1">
              Submit to iNaturalist
            </button>
          </div>

        </div>
      </div>
    </motion.div>
  )
}

// ── Main Camera component ─────────────────────────────────────────────────────
export default function Camera() {
  const [preview,     setPreview]     = useState(null)
  const [result,      setResult]      = useState(null)
  const [speciesInfo, setSpeciesInfo] = useState(null)
  const [loading,     setLoading]     = useState(false)
  const [loadingInfo, setLoadingInfo] = useState(false)
  const [error,       setError]       = useState(null)

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader   = new FileReader()
    reader.onload  = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  const processFile = async (file) => {
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

      // ── Step 1: Identify species ────────────────────────────────────────
      let identified
      try {
        const res  = await fetch(`${API_BASE}/species/identify`, {
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

      // ── Step 2: Fetch iNaturalist facts ─────────────────────────────────
      if (identified.taxon_id) {
        setLoadingInfo(true)
        try {
          const infoRes = await fetch(`${API_BASE}/species/info?taxon_id=${identified.taxon_id}`)
          const info    = await infoRes.json()
          setSpeciesInfo(info)
        } catch (err) {
          setSpeciesInfo({
            description: 'A large, striking butterfly known for its orange and black wings with white spots along the edges.',
            habitat:     'Open fields, meadows, roadsides, and gardens with milkweed plants.',
            diet:        'Adults drink nectar from flowers. Caterpillars eat exclusively milkweed leaves.',
            where_found: 'North America, migrating annually to central Mexico and coastal California for winter.',
            fun_fact:    'Monarchs can travel up to 100 miles per day during migration and live up to 8 months.',
          })
        } finally {
          setLoadingInfo(false)
        }
      }

    } catch (e) {
      setError('Identification failed. Try again.')
      setLoading(false)
    }
  }

  const handleCapture      = () => openCamera(processFile)
  const handleGlassesPhoto = () => openGlassesPhoto(processFile)

  const reset = () => {
    setResult(null)
    setSpeciesInfo(null)
    setPreview(null)
    setError(null)
  }

  return (
    <div className="relative w-full h-screen">

      {/* Camera screen always underneath */}
      <CameraScreen
        onCapture={handleCapture}
        onGlassesPhoto={handleGlassesPhoto}
        loading={loading}
      />

      {/* Error toast */}
      {error && (
        <div className="absolute top-16 left-4 right-4 z-40 bg-red-900/80 border border-red-700 rounded-xl px-4 py-3 text-xs text-red-300 font-body text-center">
          {error}
        </div>
      )}

      {/* Result screen slides in on top and stays until dismissed */}
      <AnimatePresence>
        {result && preview && (
          <ResultScreen
            preview={preview}
            result={result}
            speciesInfo={speciesInfo}
            loadingInfo={loadingInfo}
            onReset={reset}
          />
        )}
      </AnimatePresence>

    </div>
  )
}