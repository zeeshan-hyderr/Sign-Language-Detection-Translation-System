import GlassCard from './GlassCard'

function StatCard({ icon, label, value }) {
  return (
    <GlassCard className="stat-card floating">
      <div className="icon-wrap">{icon}</div>
      <p className="stat-value">{value}</p>
      <p className="muted">{label}</p>
    </GlassCard>
  )
}

export default StatCard
