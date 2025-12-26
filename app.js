const { useState } = React;

function App() {
  const [activeSection, setActiveSection] = useState('home');

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        padding: '20px',
        background: 'rgba(0,0,0,0.2)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <nav style={{ display: 'flex', justifyContent: 'center', gap: '30px' }}>
          <button onClick={() => setActiveSection('home')} style={{
            background: activeSection === 'home' ? 'rgba(255,255,255,0.2)' : 'transparent',
            border: 'none',
            color: 'white',
            padding: '10px 20px',
            cursor: 'pointer',
            borderRadius: '5px',
            fontSize: '16px'
          }}>Home</button>
          <button onClick={() => setActiveSection('about')} style={{
            background: activeSection === 'about' ? 'rgba(255,255,255,0.2)' : 'transparent',
            border: 'none',
            color: 'white',
            padding: '10px 20px',
            cursor: 'pointer',
            borderRadius: '5px',
            fontSize: '16px'
          }}>About</button>
          <button onClick={() => setActiveSection('projects')} style={{
            background: activeSection === 'projects' ? 'rgba(255,255,255,0.2)' : 'transparent',
            border: 'none',
            color: 'white',
            padding: '10px 20px',
            cursor: 'pointer',
            borderRadius: '5px',
            fontSize: '16px'
          }}>Projects</button>
          <button onClick={() => setActiveSection('contact')} style={{
            background: activeSection === 'contact' ? 'rgba(255,255,255,0.2)' : 'transparent',
            border: 'none',
            color: 'white',
            padding: '10px 20px',
            cursor: 'pointer',
            borderRadius: '5px',
            fontSize: '16px'
          }}>Contact</button>
        </nav>
      </header>

      {/* Main Content */}
      <main style={{ padding: '60px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        {activeSection === 'home' && (
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '4rem', marginBottom: '20px', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>Bala Shiva Teja</h1>
            <p style={{ fontSize: '1.5rem', marginBottom: '30px' }}>Full Stack Developer & AI Enthusiast</p>
            <p style={{ fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
              Passionate about creating innovative solutions using modern web technologies and artificial intelligence.
            </p>
          </div>
        )}

        {activeSection === 'about' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '3rem', marginBottom: '30px' }}>About Me</h2>
            <p style={{ fontSize: '1.2rem', lineHeight: '1.8', marginBottom: '20px' }}>
              I am a dedicated software developer with expertise in building scalable web applications.
              My passion lies in leveraging cutting-edge technologies to solve complex problems.
            </p>
            <h3 style={{ fontSize: '2rem', marginTop: '40px', marginBottom: '20px' }}>Skills</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '10px' }}>
                <h4>Frontend</h4>
                <p>React, JavaScript, HTML, CSS</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '10px' }}>
                <h4>Backend</h4>
                <p>Node.js, Python, Express</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '10px' }}>
                <h4>AI/ML</h4>
                <p>TensorFlow, PyTorch, NLP</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '10px' }}>
                <h4>Tools</h4>
                <p>Git, Docker, AWS</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'projects' && (
          <div>
            <h2 style={{ fontSize: '3rem', marginBottom: '30px', textAlign: 'center' }}>My Projects</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '30px', borderRadius: '15px' }}>
                <h3 style={{ marginBottom: '15px' }}>AI Chat Assistant</h3>
                <p style={{ lineHeight: '1.6' }}>An intelligent chatbot powered by advanced NLP models, capable of contextual conversations and task automation.</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '30px', borderRadius: '15px' }}>
                <h3 style={{ marginBottom: '15px' }}>E-commerce Platform</h3>
                <p style={{ lineHeight: '1.6' }}>A full-stack e-commerce solution with real-time inventory management and secure payment integration.</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '30px', borderRadius: '15px' }}>
                <h3 style={{ marginBottom: '15px' }}>Portfolio Website</h3>
                <p style={{ lineHeight: '1.6' }}>A modern, responsive portfolio showcasing projects and skills with smooth animations and interactions.</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'contact' && (
          <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '3rem', marginBottom: '30px' }}>Get In Touch</h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '40px', lineHeight: '1.8' }}>
              I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>
              <a href="https://github.com/BalaShivaTeja" target="_blank" rel="noopener noreferrer" style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '15px 30px',
                borderRadius: '10px',
                textDecoration: 'none',
                color: 'white',
                fontSize: '1.1rem',
                transition: 'background 0.3s'
              }}>GitHub</a>
              <a href="https://linkedin.com/in/balashivateja" target="_blank" rel="noopener noreferrer" style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '15px 30px',
                borderRadius: '10px',
                textDecoration: 'none',
                color: 'white',
                fontSize: '1.1rem'
              }}>LinkedIn</a>
              <a href="mailto:bala@example.com" style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '15px 30px',
                borderRadius: '10px',
                textDecoration: 'none',
                color: 'white',
                fontSize: '1.1rem'
              }}>Email</a>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '30px',
        background: 'rgba(0,0,0,0.2)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        marginTop: '60px'
      }}>
        <p>&copy; {new Date().getFullYear()} Bala Shiva Teja. All rights reserved.</p>
      </footer>
    </div>
  );
}

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
