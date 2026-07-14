import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css'; // Share styling with Login

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await register(username, email, password);
      navigate('/home');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Username or email might be taken.');
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
            <h3>Create Account</h3>
            <p>Join Aura Stream to start building your library</p>
          </div>

          {errorMsg && (
            <div className="auth-error-alert">
              <ShieldAlert size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Username Input */}
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <div className="input-wrapper">
                <User className="input-icon" size={18} />
                <input
                  type="text"
                  id="username"
                  placeholder="e.g. alex_music"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input
                  type="email"
                  id="email"
                  placeholder="e.g. alex@aurastream.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input
                  type="password"
                  id="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn-auth-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Sign Up'}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="auth-card-footer">
            <span>Already have an account? <Link to="/login" className="auth-link">Log In</Link></span>
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

export default Signup;
