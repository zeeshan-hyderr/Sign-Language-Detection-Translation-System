import { Link } from 'react-router-dom'
import { Activity, Languages, ShieldCheck } from 'lucide-react'
import Navbar from '../components/Navbar'
import ParticleBackground from '../components/ParticleBackground'
import SignLogo from '../components/SignLogo'
import GlassCard from '../components/GlassCard'

function Home() {
  const chips = [
    { label: '90%+ Accuracy', icon: <ShieldCheck size={16} /> },
    { label: 'Real-Time', icon: <Activity size={16} /> },
    { label: 'Bilingual (English + Sindhi)', icon: <Languages size={16} /> },
  ]
  return (
    <div className="page home">
      <ParticleBackground />
      <Navbar />
      <main className="hero">
        <div>
          <SignLogo className="pulse-logo" />
        </div>
        <h1>Welcome to "Sigdhi-Sign Connect"</h1>
        <p>Bridging Communication Between Signers & Non-Signers in Real-Time</p>
        <div className="row">
          <Link className="btn-primary" to="/get-started">Get Started</Link>
        </div>
        <div className="chip-grid">
          {chips.map((chip) => (
            <GlassCard key={chip.label} className="chip floating">
              {chip.icon} {chip.label}
            </GlassCard>
          ))}
        </div>
      </main>
    </div>
  )
}

export default Home
