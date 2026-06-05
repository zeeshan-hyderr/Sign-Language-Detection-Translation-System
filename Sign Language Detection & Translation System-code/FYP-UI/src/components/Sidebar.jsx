import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { Home, ScanLine, Bot, History, Settings, LogOut, LayoutDashboard } from 'lucide-react'
import { clearSession, getSession } from '../utils/auth'

function Sidebar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const session = useMemo(() => getSession(), [])
  const items = [
    { icon: <LayoutDashboard size={18} />, label: 'Dashboard', to: '/dashboard' },
    { icon: <ScanLine size={18} />, label: 'Sign Recognizer', to: '/recognize' },
    { icon: <Bot size={18} />, label: 'Avatar', to: '/avatar' },
    { icon: <History size={18} />, label: 'History', to: '/dashboard' },
    { icon: <Settings size={18} />, label: 'Settings', to: '/dashboard' },
  ]

  const initials = session?.fullName
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'DU'

  const handleLogout = () => {
    clearSession()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <div>
        <div className="user-chip glass-card">
          <div className="avatar-dot">{initials}</div>
          <div>
            <p>{session?.fullName || 'Demo User'}</p>
            <span className="role-badge">{session?.role || 'Signer'}</span>
          </div>
        </div>
        <nav>
          {items.map((item) => (
            <Link key={item.label} to={item.to} className={pathname === item.to ? 'active' : ''}>
              {item.icon}
              {item.label}
            </Link>
          ))}
          <button type="button" className="sidebar-action" onClick={handleLogout}>
            <LogOut size={18} />
            Logout
          </button>
        </nav>
      </div>
      <small>v1.0.0</small>
    </aside>
  )
}

export default Sidebar
