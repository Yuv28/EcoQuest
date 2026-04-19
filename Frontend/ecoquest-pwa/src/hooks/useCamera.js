import { useRef, useState, useCallback } from 'react'

export function useCamera() {
  const videoRef   = useRef(null)
  const [stream, setStream]     = useState(null)
  const [capturing, setCapturing] = useState(false)

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',  // back camera on iPhone
          width:  { ideal: 1280 },
          height: { ideal: 720 },
        }
      })
      if (videoRef.current) videoRef.current.srcObject = mediaStream
      setStream(mediaStream)
      setCapturing(true)
    } catch (err) {
      console.error('Camera error:', err)
      throw err
    }
  }, [])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return null
    const canvas = document.createElement('canvas')
    canvas.width  = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0)
    // Returns base64 JPEG — send this to Rekognition via Lambda
    return canvas.toDataURL('image/jpeg', 0.85).split(',')[1]
  }, [])

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach(t => t.stop())
    setStream(null)
    setCapturing(false)
  }, [stream])

  return { videoRef, capturing, startCamera, capturePhoto, stopCamera }
}
