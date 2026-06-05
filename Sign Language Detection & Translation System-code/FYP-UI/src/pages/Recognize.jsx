import { Camera, Languages } from 'lucide-react'
import Navbar from '../components/Navbar'
import GlassCard from '../components/GlassCard'
import WebcamFeed from '../components/WebcamFeed'
import { useState, useEffect, useCallback } from 'react'
import { checkBackendHealth, translateGlosses, extractLandmarks, predictGlosses } from '../utils/signApi'

function Recognize() {
  const [backendOnline, setBackendOnline] = useState(null) // null=checking, true, false
  const [glosses, setGlosses] = useState([]) // [{gloss, score}]
  const [translatedText, setTranslatedText] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)
  const [history, setHistory] = useState([]) // [{text, time}]
  const [lang, setLang] = useState('English')
  const [error, setError] = useState('')
  const [mode, setMode] = useState('camera') // 'camera' or 'upload'
  const [videoURL, setVideoURL] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const ok = await checkBackendHealth()
        if (mounted) setBackendOnline(ok)
      } catch (e) {
        if (mounted) setBackendOnline(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  const pushHistory = (text) => {
    const item = { text, time: new Date().toLocaleTimeString() }
    setHistory((h) => [item, ...h].slice(0, 10))
  }

  const doTranslate = useCallback(async (glossList, targetLang) => {
    if (!glossList || glossList.length === 0) return null
    setIsTranslating(true)
    setError('')
    try {
      const res = await translateGlosses(glossList, targetLang)
      const text = res?.text || ''
      setTranslatedText(text)
      pushHistory(text)
      return text
    } catch (e) {
      const msg = `Translation failed: ${e?.message || e}`
      setError(msg)
      return null
    } finally {
      setIsTranslating(false)
    }
  }, [])

  const handlePrediction = async (predictions) => {
    setGlosses(predictions || [])
    try {
      const glossList = (predictions || []).map((p) => p.gloss)
      await doTranslate(glossList, lang)
    } catch (e) {
      const msg = `Prediction handling failed: ${e?.message || e}`
      setError(msg)
    }
  }

  const handleLangClick = async (newLang) => {
    setLang(newLang)
    if (glosses && glosses.length > 0) {
      await doTranslate(glosses.map((p) => p.gloss), newLang)
    }
  }

  const handleSpeak = () => {
    if (!translatedText) return
    try {
      const u = new SpeechSynthesisUtterance(translatedText)
      window.speechSynthesis.speak(u)
    } catch (e) {
      setError(`Speak failed: ${e?.message || e}`)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(translatedText || '')
    } catch (e) {
      setError(`Copy failed: ${e?.message || e}`)
    }
  }

  const handleClear = () => {
    setGlosses([])
    setTranslatedText('')
    setError('')
  }

  return (
    <div className="page">
      <Navbar />
      <main className="split">
        <GlassCard>
          <h2>
            <Camera size={18} /> Sign Language Input
            <span style={{ marginLeft: 12, fontSize: 12 }}>
              {backendOnline === null && <small>Checking backend...</small>}
              {backendOnline === true && <span style={{ color: 'green' }}> ● Backend online</span>}
              {backendOnline === false && <span style={{ color: 'red' }}> ● Backend offline — start the Python server</span>}
            </span>
          </h2>

          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button className={mode === 'camera' ? 'active' : ''} onClick={() => { setMode('camera'); setVideoURL(null); }}>Use Webcam</button>
            <button className={mode === 'upload' ? 'active' : ''} onClick={() => setMode('upload')}>Upload Video for Prediction</button>
          </div>

          {mode === 'camera' && (
            <WebcamFeed onPrediction={handlePrediction} onError={(m) => setError(m)} />
          )}

          {mode === 'upload' && (
            <div style={{ border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: 12 }}>
              <input
                type="file"
                accept="video/mp4,video/*"
                onChange={async (e) => {
                  const f = e.target.files && e.target.files[0]
                  if (!f) return
                  setError('')
                  if (!f.type.startsWith('video/')) {
                    setError('Please select a video file')
                    return
                  }
                  if (videoURL) { URL.revokeObjectURL(videoURL) }
                  const url = URL.createObjectURL(f)
                  setVideoURL(url)
                }}
              />
              {videoURL && (
                <div style={{ marginTop: 12 }}>
                  <video src={videoURL} controls style={{ maxWidth: '100%', borderRadius: 6 }} />
                  <div className="row" style={{ marginTop: 8 }}>
                    <button
                      className="btn-primary"
                      disabled={isProcessing}
                      onClick={async () => {
                        try {
                          setIsProcessing(true)
                          setError('')
                          const resp = await fetch(videoURL)
                          const blob = await resp.blob()
                          const extractRes = await extractLandmarks(blob)
                          const predRes = await predictGlosses(extractRes.landmarks)
                          const preds = predRes?.predictions || []
                          await handlePrediction(preds)
                        } catch (e) {
                          setError(`Upload prediction failed: ${e?.message || e}`)
                        } finally {
                          setIsProcessing(false)
                        }
                      }}
                    >
                      {isProcessing ? 'Processing...' : 'Run Prediction'}
                    </button>
                    <button className="btn-outline-cyan" onClick={() => { setVideoURL(null); setError('') }}>Clear</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {glosses && glosses.length > 0 && (
            <div className="pill-row" style={{ marginTop: 12 }}>
              {glosses.map((p, i) => (
                <span key={i} className="gloss-pill">{p.gloss} {Math.round((p.score||0)*100)}%</span>
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard>
          <h2><Languages size={18} /> Translation Output</h2>

          <div className="output-box">
            {isTranslating ? <div className="spinner">Processing...</div> : (translatedText || <em>Recognized sign language will appear here...</em>)}
          </div>

          <div className="pill-row">
            {['English', 'Sindhi', 'Urdu'].map((l) => (
              <button key={l} className={lang === l ? 'active' : ''} onClick={() => handleLangClick(l)}>{l}</button>
            ))}
          </div>

          <div className="row">
            <button className="btn-primary" onClick={handleSpeak}>Speak Output</button>
            <button className="btn-outline-cyan" onClick={handleCopy}>Copy Text</button>
            <button className="btn-outline-cyan" onClick={handleClear}>Clear</button>
          </div>

          {error ? <p className="error-text">{error}</p> : null}

          <div className="history-list">
            {history.map((item, i) => (
              <div key={i} className="glass-card history-item">{item.text} <small>{item.time}</small></div>
            ))}
          </div>
        </GlassCard>
      </main>
    </div>
  )
}

export default Recognize
