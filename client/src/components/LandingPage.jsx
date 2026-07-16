import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Sparkles, Heart, Headphones, Compass, Send, MessageSquare, Shield } from 'lucide-react';
import '../styles/LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* Navbar */}
      <nav className="landing-nav glass-panel">
        <div className="logo" onClick={() => navigate('/')}>
          <div className="logo-icon">
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </div>
          <span className="logo-text">Aura Stream</span>
        </div>
        <div className="nav-links">
          <a href="#features">Discover</a>
          <a href="#premium">Premium</a>
          <a href="#about">About</a>
        </div>
        <div className="nav-actions">
          <Link to="/login" className="btn-login">Log In</Link>
          <Link to="/signup" className="btn-signup">Sign Up</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="landing-hero">
        <div className="hero-content">
          <div className="experience-tag">
            <Sparkles size={14} className="icon-sparkle" />
            <span>EXPERIENCE SOUND IN 8D</span>
          </div>
          <h1>Music <em>touches</em> the soul</h1>
          <p>
            Dive into a curated auditory journey where high-fidelity sound meets personalized emotional intelligence. Aura Stream learns your rhythm.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => navigate('/signup')}>
              Start Your Journey <Play size={16} fill="currentColor" />
            </button>
            <button className="btn-secondary" onClick={() => navigate('/login')}>
              Explore Catalog
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="blob-glow"></div>
          <img src="./assets/landing_hero.png" alt="Aura Soundwave Render" className="floating-img" />
        </div>
      </header>

      {/* Engineered for Emotion Section */}
      <section className="features-section" id="features">
        <h2 className="section-title">Engineered for Emotion</h2>
        <p className="section-subtitle">We don't just play tracks; we curate atmospheres based on your biological response to sound.</p>
        
        <div className="features-grid">
          {/* Card 1 */}
          <div className="feature-card glass-panel clickable-card">
            <div className="feature-icon-wrapper heart-icon">
              <Heart size={24} fill="currentColor" />
            </div>
            <h3>Save Emotions</h3>
            <p>Tag your songs with emotional bookmarks. Find music that matches your exact state of mind, from 'Deep Focus' to 'Late Night Reflection'.</p>
            <div className="card-mock-img hover-lift">
              <div className="gradient-glow red-glow"></div>
              <div className="mock-wave">
                <span className="wave-bar" style={{ height: '30%' }}></span>
                <span className="wave-bar" style={{ height: '60%' }}></span>
                <span className="wave-bar" style={{ height: '40%' }}></span>
                <span className="wave-bar" style={{ height: '80%' }}></span>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="feature-card glass-panel span-two clickable-card">
            <div className="feature-icon-wrapper playlist-icon">
              <Sparkles size={24} />
            </div>
            <div className="card-split-content">
              <div>
                <h3>Personalized Playlists</h3>
                <p>Our neural engine builds daily soundtracks based on your listening habits and time of day. Your morning and midnight sound completely different.</p>
              </div>
              <div className="mock-playlist-ui">
                <div className="mock-row">
                  <div className="mock-box bg-purple"></div>
                  <div className="mock-lines">
                    <span className="line-long"></span>
                    <span className="line-short"></span>
                  </div>
                </div>
                <div className="mock-row">
                  <div className="mock-box bg-blue"></div>
                  <div className="mock-lines">
                    <span className="line-long"></span>
                    <span className="line-short"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="feature-card glass-panel clickable-card">
            <div className="feature-icon-wrapper audio-icon">
              <Headphones size={24} />
            </div>
            <h3>Lossless Audio</h3>
            <p>Hear every breath and instrument with 24-bit/192kHz studio quality streaming. Studio sound directly in your pocket.</p>
          </div>

          {/* Card 4 */}
          <div className="feature-card glass-panel clickable-card">
            <div className="feature-icon-wrapper discover-icon">
              <Compass size={24} />
            </div>
            <h3>Smart Discover</h3>
            <p>Go beyond the charts. Discover emerging artists tailored to your unique sonic profile.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" id="premium">
        <div className="cta-card glass-panel">
          <div className="cta-glow"></div>
          <h2>Ready to redefine your auditory world?</h2>
          <p>Join 5 million audiophiles and start your 30-day free trial of Aura Stream Premium today. No commitment, just pure sound.</p>
          <div className="cta-buttons">
            <button className="btn-primary" onClick={() => navigate('/signup')}>Get Aura Free</button>
            <button className="btn-white" onClick={() => navigate('/signup')}>Go Premium</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-cols">
          <div className="footer-col-about">
            <div className="logo">
              <div className="logo-icon">
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
              </div>
              <span className="logo-text">Aura Stream</span>
            </div>
            <p>Connecting souls through the universal language of sound. High fidelity, deep emotion.</p>
            <div className="social-row">
              <span className="social-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-github">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </span>
              <span className="social-icon"><MessageSquare size={18} /></span>
              <span className="social-icon"><Shield size={18} /></span>
            </div>
          </div>
          
          <div className="footer-col">
            <h4>Product</h4>
            <Link to="/signup">Download</Link>
            <Link to="/login">Web Player</Link>
            <a href="#premium">Devices</a>
          </div>

          <div className="footer-col">
            <h4>Features</h4>
            <a href="#features">Emotion Tagging</a>
            <a href="#features">8D Audio</a>
            <a href="#features">Live Concerts</a>
          </div>

          <div className="footer-col-newsletter">
            <h4>Newsletter</h4>
            <p>Stay updated with the latest sonic trends.</p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Email address" required />
              <button type="submit"><Send size={16} /></button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Aura Stream Inc. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#cookies">Cookies</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
