import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';

const Login = () => {
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identity || !password) {
      setErrorMsg('Please enter both username/email and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await login(identity, password);
      navigate('/home');
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-background-effects">
        <div className="auth-glow-blob purple-blob"></div>
        <div className="auth-glow-blob blue-blob"></div>
      </div>

      <div className="auth-wrapper">
        {/* Brand Header */}
        <div className="auth-brand" onClick={() => navigate('/')}>
          <div className="brand-logo-icon">
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </div>
          <h2>Aura Stream</h2>
          <p>SONIC DEPTH</p>
        </div>

        {/* Auth Form Card */}
        <div className="auth-card glass-panel">
          <div className="auth-card-header">
            <h3>Welcome Back</h3>
            <p>Enter your credentials to access your library</p>
          </div>

          {errorMsg && (
            <div className="auth-error-alert">
              <ShieldAlert size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Identity Input */}
            <div className="form-group">
              <label htmlFor="identity">Email or Username</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input
                  type="text"
                  id="identity"
                  placeholder="e.g. alex@aurastream.com"
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="form-group">
              <div className="label-row">
                <label htmlFor="password">Password</label>
                <a href="#forgot" className="forgot-link">Forgot Password?</a>
              </div>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
                <button
                  type="button"
                  className="btn-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="remember-group">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="checkmark"></span>
                Remember this device
              </label>
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn-auth-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Verifying...' : 'Log In'}
            </button>
          </form>

          {/* Social Continue */}
          <div className="social-divider">
            <span>OR CONTINUE WITH</span>
          </div>

          <div className="social-grid">
            <button className="btn-social-auth" type="button">
              <svg className="social-svg" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.64l3.15-3.15C17.45 1.74 14.94 1 12 1 7.35 1 3.39 3.67 1.44 7.6l3.82 2.96C6.18 7.52 8.85 5.04 12 5.04z"/>
                <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.43h6.48c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-1.99 3.49-4.92 3.49-8.54z"/>
                <path fill="#FBBC05" d="M5.26 14.64a7.12 7.12 0 0 1 0-4.28L1.44 7.6a11.96 11.96 0 0 0 0 8.8l3.82-2.96z"/>
                <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.03.69-2.34 1.1-3.96 1.1-3.15 0-5.82-2.48-6.78-5.52l-3.82 2.96C3.39 20.33 7.35 23 12 23z"/>
              </svg>
            </button>
            <button className="btn-social-auth" type="button">
              <svg className="social-svg" viewBox="0 0 24 24">
                <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>
            <button className="btn-social-auth" type="button">
              <svg className="social-svg" viewBox="0 0 24 24" fill="#ffffff">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.5-.64.74-1.2 1.88-1.05 2.99 1.12.09 2.27-.58 3-.143z"/>
              </svg>
            </button>
          </div>

          {/* Footer Navigation */}
          <div className="auth-card-footer">
            <span>Don't have an account? <Link to="/signup" className="auth-link">Sign Up</Link></span>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="auth-copyright">
          <span>&copy; 2024 AURA STREAM &bull; SOUND WITHOUT LIMITS</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
