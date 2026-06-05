import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Activity, BarChart3, Languages, MonitorCheck } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import StatCard from '../components/StatCard'
import GlassCard from '../components/GlassCard'

const data = [
  { day: 'Mon', accuracy: 86 },
  { day: 'Tue', accuracy: 88 },
  { day: 'Wed', accuracy: 89 },
  { day: 'Thu', accuracy: 91 },
  { day: 'Fri', accuracy: 92 },
]

function Dashboard() {
  return (
    <div className="dashboard-page">
      <Sidebar />
      <main className="dashboard-main">
        <section className="stats-grid">
          <StatCard icon={<Activity />} value="124" label="Total Sessions" />
          <StatCard icon={<MonitorCheck />} value="1,842" label="Signs Recognized" />
          <StatCard icon={<Languages />} value="2" label="Languages" />
          <StatCard icon={<BarChart3 />} value="91.3%" label="Accuracy" />
        </section>
        <section className="split">
          <GlassCard>
            <h3>Recent Activity</h3>
            {['Hello there', 'Need help', 'Thank you', 'Emergency', 'Please wait'].map((item) => (
              <div key={item} className="history-item glass-card">{item}</div>
            ))}
          </GlassCard>
          <GlassCard>
            <h3>Recognition Accuracy Over Time</h3>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <LineChart data={data}>
                  <CartesianGrid stroke="#1f3b82" />
                  <XAxis dataKey="day" stroke="#A0AEC0" />
                  <YAxis stroke="#A0AEC0" />
                  <Tooltip />
                  <Line type="monotone" dataKey="accuracy" stroke="#00D4FF" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </section>
      </main>
    </div>
  )
}

export default Dashboard
