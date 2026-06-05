import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

function Avatar() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Navbar />
      <iframe
        src="https://text-to-isl-main-1.onrender.com/"
        style={{ flex: 1, border: 'none', borderRadius: '8px', marginTop: '100px', marginBottom: '20px', marginLeft: '20px', marginRight: '20px'  }}
        title="Text to ISL"
      />
    </div>
  )
}

export default Avatar
