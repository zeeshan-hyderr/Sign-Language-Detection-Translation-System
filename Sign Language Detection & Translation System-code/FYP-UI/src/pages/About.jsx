import Navbar from '../components/Navbar'
import GlassCard from '../components/GlassCard'

function About() {
  return (
    <div className="page">
      <Navbar />
      <main className="container">
        <GlassCard>
          <h1>About Sindhi-Sign Connect</h1>
          <p>
            Sindhi-Sign Connect is an innovative platform designed to bridge the communication gap between Deaf and hearing communities by providing real-time sign language recognition and translation services.
          </p>
        </GlassCard>

        <GlassCard>
          <h2>🎯 Our Mission</h2>
          <p>
            To empower Deaf individuals and those learning sign language by providing accessible, AI-powered tools for sign language recognition and text-to-sign translation in Sindhi and English.
          </p>
        </GlassCard>

        <GlassCard>
          <h2>✨ Key Features</h2>
          <ul>
            <li><strong>Sign Recognizer:</strong> Real-time recognition of sign language gestures using advanced pose estimation</li>
            <li><strong>Avatar Translator:</strong> Convert text to animated sign language with a 3D avatar</li>
            <li><strong>Multi-language Support:</strong> Full support for English and Sindhi sign language</li>
            <li><strong>User-friendly Interface:</strong> Intuitive design accessible to all users</li>
          </ul>
        </GlassCard>

        <GlassCard>
          <h2>🚀 Technology Stack</h2>
          <p>
            Built with cutting-edge AI and machine learning technologies including:
          </p>
          <ul>
            <li>MediaPipe for pose and gesture detection</li>
            <li>Deep Learning models for sign language recognition</li>
            <li>React.js for dynamic user interface</li>
            <li>Python-based backend for AI processing</li>
            <li>3D avatar rendering for sign language animation</li>
          </ul>
        </GlassCard>

        <GlassCard>
          <h2>👥 Who We Serve</h2>
          <p>
            Our platform is designed for:
          </p>
          <ul>
            <li>Deaf and hard of hearing individuals</li>
            <li>Students learning sign language</li>
            <li>Interpreters and sign language professionals</li>
            <li>Educators and organizations working with Deaf communities</li>
          </ul>
        </GlassCard>

        <GlassCard>
          <h2>💡 Vision for the Future</h2>
          <p>
            We envision a world where language barriers no longer limit communication. Our goal is to expand our platform to support more sign languages, improve recognition accuracy, and create more immersive learning experiences.
          </p>
        </GlassCard>

        <GlassCard>
          <h2>📧 Get in Touch</h2>
          <p>
            Have questions or feedback? We'd love to hear from you! Contact us to learn more about Sindhi-Sign Connect or to contribute to our mission.
          </p>
        </GlassCard>
      </main>
    </div>
  )
}

export default About
