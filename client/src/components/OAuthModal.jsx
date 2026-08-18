import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import '../styles/OAuthModal.css';

const PROVIDER_DETAILS = {
  google: {
    name: 'Google',
    domain: 'google.com',
    color: '#1a73e8',
    defaultEmail: 'qn50606@gmail.com',
    defaultName: 'Quang Anh Nguyễn',
    buttonText: 'Continue as Quang Anh',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
  },
  facebook: {
    name: 'Facebook',
    domain: 'facebook.com',
    color: '#1877F2',
    defaultEmail: 'quanganh.fb@aurastream.com',
    defaultName: 'Quang Anh Nguyễn',
    buttonText: 'Continue as Quang Anh',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80'
  },
  twitch: {
    name: 'Twitch',
    domain: 'twitch.tv',
    color: '#9146FF',
    defaultEmail: 'quanganh.streamer@twitch.tv',
    defaultName: 'Quang Anh (Twitch)',
    buttonText: 'Continue as Quang Anh',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=150&q=80'
  },
  apple: {
    name: 'Apple',
    domain: 'apple.com',
    color: '#000000',
    defaultEmail: 'quanganh.apple@icloud.com',
    defaultName: 'Quang Anh Nguyễn',
    buttonText: 'Continue with Apple ID',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'
  },
  x: {
    name: 'X',
    domain: 'x.com',
    color: '#000000',
    defaultEmail: 'quanganh.x@aurastream.com',
    defaultName: 'Quang Anh @quanganh296',
    buttonText: 'Continue with X',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
  }
};

const OAuthModal = ({ provider, onConfirm, onCancel }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const info = PROVIDER_DETAILS[provider?.toLowerCase()] || PROVIDER_DETAILS.google;

  const handleConfirm = () => {
    setIsAuthenticating(true);
    setTimeout(() => {
      onConfirm(provider, { name: info.defaultName, email: info.defaultEmail });
    }, 800);
  };

  return (
    <div className="google-onetap-overlay">
      <div className="google-onetap-card">
        {/* Widget Top Header Bar */}
        <div className="google-onetap-header">
          <div className="google-header-left">
            <svg className="google-g-icon" viewBox="0 0 24 24" width="20" height="20">
              <path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.64l3.15-3.15C17.45 1.74 14.94 1 12 1 7.35 1 3.39 3.67 1.44 7.6l3.82 2.96C6.18 7.52 8.85 5.04 12 5.04z"/>
              <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.43h6.48c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-1.99 3.49-4.92 3.49-8.54z"/>
              <path fill="#FBBC05" d="M5.26 14.64a7.12 7.12 0 0 1 0-4.28L1.44 7.6a11.96 11.96 0 0 0 0 8.8l3.82-2.96z"/>
              <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.03.69-2.34 1.1-3.96 1.1-3.15 0-5.82-2.48-6.78-5.52l-3.82 2.96C3.39 20.33 7.35 23 12 23z"/>
            </svg>
            <span className="google-onetap-title">
              Sign in to aurastream.com with {info.domain}
            </span>
          </div>
          <button className="google-onetap-close" onClick={onCancel} title="Close">
            <X size={16} />
          </button>
        </div>

        {/* Account Info Card */}
        <div className="google-onetap-account" onClick={handleConfirm}>
          <img
            src={info.avatar}
            alt={info.defaultName}
            className="google-onetap-avatar"
          />
          <div className="google-onetap-user-details">
            <span className="google-onetap-name">{info.defaultName}</span>
            <span className="google-onetap-email">{info.defaultEmail}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="google-onetap-footer">
          <button
            className="google-onetap-btn"
            onClick={handleConfirm}
            disabled={isAuthenticating}
            style={{ backgroundColor: info.color }}
          >
            {isAuthenticating ? (
              <>
                <Loader2 size={16} className="spinner" />
                <span>Signing in...</span>
              </>
            ) : (
              info.buttonText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OAuthModal;
