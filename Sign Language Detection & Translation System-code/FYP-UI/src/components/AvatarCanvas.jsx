import { useState } from 'react'

function AvatarCanvas() {
  const [speed, setSpeed] = useState(1)

  return (
    <div>
      <div className="avatar-canvas">
        <div className="silhouette" />
      </div>
      <div className="avatar-controls">
        <button className="btn-outline-cyan">Play/Pause</button>
        <button className="btn-outline-cyan">Loop</button>
        <label>
          Speed
          <input type="range" min="0.5" max="2" step="0.1" value={speed} onChange={(e) => setSpeed(e.target.value)} />
        </label>
        <button className="btn-outline-cyan">Reset</button>
      </div>
    </div>
  )
}

export default AvatarCanvas
