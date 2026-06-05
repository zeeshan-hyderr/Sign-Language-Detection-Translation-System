import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import SignLogo from './SignLogo'

function Navbar() {
  const [open, setOpen] = useState(false)
  const links = ['/', '/recognize', '/avatar', '/about']
  const labels = ['Home', 'Sign Recognizer', 'Avatar Translator', 'About']

  return (
    <nav className="top-nav">
      <Link to="/" className="brand">
        <SignLogo size={40} />
        <span>Sindhi-Sign Connect</span>
      </Link>
      <div className={`nav-links ${open ? 'open' : ''}`}>
        {links.map((path, i) => (
          <NavLink key={path} to={path} onClick={() => setOpen(false)}>
            {labels[i]}
          </NavLink>
        ))}
        <div className="auth-mobile">
          <Link to="/login" className="btn-outline-cyan">Login</Link>
          <Link to="/signup" className="btn-primary">Sign Up</Link>
        </div>
      </div>
      <div className="auth-desktop">
        <Link to="/login" className="btn-outline-cyan">Login</Link>
        <Link to="/signup" className="btn-primary">Sign Up</Link>
      </div>
      <button className="menu-btn" onClick={() => setOpen((p) => !p)} aria-label="Menu">
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
    </nav>
  )
}

export default Navbar
