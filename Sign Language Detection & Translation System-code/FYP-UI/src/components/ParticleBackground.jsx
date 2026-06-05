import { useEffect, useMemo, useState } from 'react'
import Particles from '@tsparticles/react'
import { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'

function ParticleBackground() {
  const [ready, setReady] = useState(false)
  const options = useMemo(
    () => ({
      fullScreen: { enable: true, zIndex: -1 },
      background: { color: 'transparent' },
      particles: {
        number: { value: 55 },
        color: { value: '#FFFFFF' },
        opacity: { value: 0.3 },
        size: { value: 2 },
        links: { enable: true, color: '#00D4FF', opacity: 0.1, distance: 120 },
        move: { enable: true, speed: 0.9 },
      },
    }),
    [],
  )

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => setReady(true))
  }, [])

  if (!ready) return null
  return <Particles id="particles" options={options} />
}

export default ParticleBackground
