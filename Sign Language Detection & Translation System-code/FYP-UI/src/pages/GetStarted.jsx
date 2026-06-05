import { ArrowRight, Bot, LayoutDashboard, ScanLine } from 'lucide-react'
import { Link } from 'react-router-dom'
import GlassCard from '../components/GlassCard'
import Navbar from '../components/Navbar'
import ParticleBackground from '../components/ParticleBackground'

const options = [
  {
    icon: <LayoutDashboard size={22} />,
    title: 'Dashboard',
    description: 'View your stats, recognition progress, and recent activity in one place.',
    to: '/dashboard',
  },
  {
    icon: <ScanLine size={22} />,
    title: 'Sign Recognizer',
    description: 'Capture signs with the camera and translate them into English or Sindhi.',
    to: '/recognize',
  },
  {
    icon: <Bot size={22} />,
    title: 'Avatar Translator',
    description: 'Convert typed or spoken text into sign language animation.',
    to: '/avatar',
  },
]

function GetStarted() {
  return (
    <div className="page">
      <ParticleBackground />
      <Navbar />
      <main className="container quick-start-page">
        <section className="quick-start-hero">
          <span className="eyebrow">Choose Your Experience</span>
          <h1>Start with the tool you need</h1>
          <p>
            Open the dashboard, recognize live signs, or generate sign-language animation
            from text and speech.
          </p>
        </section>

        <section className="quick-start-grid">
          {options.map((option) => (
            <GlassCard key={option.title} className="quick-start-card">
              <div className="feature-icon">{option.icon}</div>
              <h3>{option.title}</h3>
              <p>{option.description}</p>
              <Link to={option.to} className="btn-primary full quick-start-link">
                Open {option.title}
                <ArrowRight size={18} />
              </Link>
            </GlassCard>
          ))}
        </section>
      </main>
    </div>
  )
}

export default GetStarted
