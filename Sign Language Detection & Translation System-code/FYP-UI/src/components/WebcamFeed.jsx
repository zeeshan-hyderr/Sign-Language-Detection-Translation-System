import { useRef, useState, useEffect } from 'react'
import { extractLandmarks, predictGlosses } from '../utils/signApi'

function WebcamFeed({ onPrediction = () => {}, onError = () => {} }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])

  const [status, setStatus] = useState('off') // 'off' | 'live' | 'recording' | 'processing' | 'error'
  const [confidence, setConfidence] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    return () => {
      // cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
    }
  }, [])

  const startCamera = async () => {
    try {
      setErrorMessage('')
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setStatus('live')
    } catch (err) {
      const msg = `Camera access failed: ${err?.message || err}`
      setErrorMessage(msg)
      onError(msg)
      setStatus('off')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setStatus('off')
  }

  const handleStartRecording = () => {
    if (!streamRef.current || status !== 'live') return
    try {
      chunksRef.current = []
      const options = { mimeType: 'video/webm;codecs=vp8' }
      const mr = new MediaRecorder(streamRef.current, options)
      mediaRecorderRef.current = mr

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size) chunksRef.current.push(e.data)
      }

      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        await processRecording(blob)
      }

      mr.start()
      setStatus('recording')
    } catch (err) {
      const msg = `Recording failed: ${err?.message || err}`
      setErrorMessage(msg)
      onError(msg)
      setStatus('error')
    }
  }

  const handleStopRecording = () => {
    const mr = mediaRecorderRef.current
    if (mr && mr.state === 'recording') {
      mr.stop()
    }
    mediaRecorderRef.current = null
    setStatus((s) => (s === 'recording' ? 'processing' : s))
  }

  const processRecording = async (blob) => {
    setStatus('processing')
    setErrorMessage('')
    try {
      const extractRes = await extractLandmarks(blob)
      const { landmarks, frame_count } = extractRes
      if (typeof frame_count !== 'number' || frame_count < 20) {
        const msg = 'Sign too short — hold longer'
        setErrorMessage(msg)
        onError(msg)
        setStatus('error')
        return
      }

      const predictRes = await predictGlosses(landmarks, 5)
      const { predictions } = predictRes
      if (!predictions || predictions.length === 0) {
        const msg = 'No predictions returned'
        setErrorMessage(msg)
        onError(msg)
        setStatus('error')
        return
      }

      const top = predictions[0]
      const conf = Math.round((top?.score || 0) * 100)
      setConfidence(conf)
      onPrediction(predictions)
      setStatus('live')
    } catch (err) {
      const msg = `Processing failed: ${err?.message || err}`
      setErrorMessage(msg)
      onError(msg)
      setStatus('error')
    }
  }

  return (
    <div>
      <div className="webcam-wrap">
        <video ref={videoRef} autoPlay playsInline muted />
        <div className="pose-overlay" />
      </div>

      <p className={`status ${status}`}>
        {status === 'live' && '● LIVE'}
        {status === 'off' && '● Camera Off'}
        {status === 'recording' && '● Recording...'}
        {status === 'processing' && '● Processing...'}
        {status === 'error' && '● Error'}
      </p>

      <div className="row">
        <button className="btn-primary" onClick={startCamera}>Start Camera</button>
        <button className="btn-outline-cyan" onClick={stopCamera}>Stop Camera</button>

        <button
          className="btn-primary cyan"
          onMouseDown={handleStartRecording}
          onMouseUp={handleStopRecording}
          onMouseLeave={handleStopRecording}
          onTouchStart={(e) => { e.preventDefault(); handleStartRecording() }}
          onTouchEnd={(e) => { e.preventDefault(); handleStopRecording() }}
        >
          Hold to Sign
        </button>
      </div>

      <div className="confidence">
        <p>Recognition Confidence: {confidence}%</p>
        <div><span style={{ width: `${confidence}%` }} /></div>
      </div>

      {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
    </div>
  )
}

export default WebcamFeed
