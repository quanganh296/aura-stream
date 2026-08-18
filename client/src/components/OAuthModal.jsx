import React, { useState } from 'react';
import { ShieldCheck, X, Check, Loader2 } from 'lucide-react';
import '../styles/OAuthModal.css';

const PROVIDER_DETAILS = {
  google: {
    name: 'Google',
    color: '#EA4335',
    bg: 'rgba(234, 67, 53, 0.12)',
    logo: (
      <svg className="oauth-svg" viewBox="0 0 24 24">
        <path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.64l3.15-3.15C17.45 1.74 14.94 1 12 1 7.35 1 3.39 3.67 1.44 7.6l3.82 2.96C6.18 7.52 8.85 5.04 12 5.04z"/>
        <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.43h6.48c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-1.99 3.49-4.92 3.49-8.54z"/>
        <path fill="#FBBC05" d="M5.26 14.64a7.12 7.12 0 0 1 0-4.28L1.44 7.6a11.96 11.96 0 0 0 0 8.8l3.82-2.96z"/>
        <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.03.69-2.34 1.1-3.96 1.1-3.15 0-5.82-2.48-6.78-5.52l-3.82 2.96C3.39 20.33 7.35 23 12 23z"/>
      </svg>
    ),
    defaultEmail: 'alex.user@gmail.com',
    defaultName: 'Alex Professional'
  },
  facebook: {
    name: 'Facebook',
    color: '#1877F2',
    bg: 'rgba(24, 119, 242, 0.12)',
    logo: (
      <svg className="oauth-svg" viewBox="0 0 24 24">
        <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    defaultEmail: 'alex.fb@aurastream.com',
    defaultName: 'Alex Facebook Profile'
  },
  twitch: {
    name: 'Twitch',
    color: '#9146FF',
    bg: 'rgba(145, 70, 255, 0.12)',
    logo: (
      <svg className="oauth-svg" viewBox="0 0 24 24" fill="#9146FF">
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
      </svg>
    ),
    defaultEmail: 'alex.gamer@twitch.tv',
    defaultName: 'Alex Streamer VIP'
  },
  apple: {
    name: 'Apple',
    color: '#ffffff',
    bg: 'rgba(255, 255, 255, 0.12)',
    logo: (
      <svg className="oauth-svg" viewBox="0 0 24 24" fill="#ffffff">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.5-.64.74-1.2 1.88-1.05 2.99 1.12.09 2.27-.58 3-.143z"/>
      </svg>
    ),
    defaultEmail: 'alex.apple@icloud.com',
    defaultName: 'Alex Apple User'
  },
  x: {
    name: 'X (Twitter)',
    color: '#ffffff',
    bg: 'rgba(255, 255, 255, 0.12)',
    logo: (
      <svg className="oauth-svg" viewBox="0 0 24 24" fill="#ffffff">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    defaultEmail: 'alex.x@aurastream.com',
    defaultName: 'Alex @aura_creator'
  }
};

const OAuthModal = ({ provider, onConfirm, onCancel }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const info = PROVIDER_DETAILS[provider?.toLowerCase()] || PROVIDER_DETAILS.google;

  const handleConfirm = () => {
    setIsAuthenticating(true);
    setTimeout(() => {
      onConfirm(provider, { name: info.defaultName, email: info.defaultEmail });
    }, 1000);
  };

  return (
    <div className="oauth-modal-overlay">
      <div className="oauth-modal-container glass-panel">
        <button className="oauth-close-btn" onClick={onCancel} title="Hủy">
          <X size={18} />
        </button>

        <div className="oauth-header">
          <div className="oauth-provider-badge" style={{ backgroundColor: info.bg }}>
            {info.logo}
          </div>
          <h3>Xác nhận đăng nhập với {info.name}</h3>
          <p>Ứng dụng <strong>Aura Stream</strong> đang yêu cầu xác thực tài khoản</p>
        </div>

        <div className="oauth-user-card">
          <img
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
            alt="Profile Avatar"
            className="oauth-avatar"
          />
          <div className="oauth-user-info">
            <span className="oauth-user-name">{info.defaultName}</span>
            <span className="oauth-user-email">{info.defaultEmail}</span>
          </div>
          <span className="oauth-check-badge">
            <Check size={14} />
          </span>
        </div>

        <div className="oauth-scopes">
          <div className="scope-item">
            <ShieldCheck size={16} className="scope-icon" />
            <span>Truy cập địa chỉ email và thông tin hồ sơ công khai</span>
          </div>
          <div className="scope-item">
            <ShieldCheck size={16} className="scope-icon" />
            <span>Đồng bộ và quản lý thư viện âm nhạc Aura Stream</span>
          </div>
        </div>

        <div className="oauth-actions">
          <button className="btn-oauth-cancel" onClick={onCancel} disabled={isAuthenticating}>
            Hủy
          </button>
          <button
            className="btn-oauth-confirm"
            onClick={handleConfirm}
            disabled={isAuthenticating}
            style={{ backgroundColor: info.color === '#ffffff' ? '#7d56f3' : info.color }}
          >
            {isAuthenticating ? (
              <>
                <Loader2 size={16} className="spinner" />
                <span>Đang kết nối...</span>
              </>
            ) : (
              `Xác nhận đăng nhập`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OAuthModal;
