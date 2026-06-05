import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Recognize from './pages/Recognize'
import Avatar from './pages/Avatar'
import Dashboard from './pages/Dashboard'
import About from './pages/About'
import Login from './pages/Login'
import Signup from './pages/Signup'
import GetStarted from './pages/GetStarted'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/recognize" element={<Recognize />} />
      <Route path="/avatar" element={<Avatar />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/get-started" element={<GetStarted />} />
    </Routes>
  )
}

export default App
