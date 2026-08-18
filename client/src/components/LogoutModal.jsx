import React from 'react';
import ReactDOM from 'react-dom';
import { LogOut, X } from 'lucide-react';
import '../styles/LogoutModal.css';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="logout-modal-overlay">
      <div className="logout-modal-container glass-panel">
        <button className="logout-close-btn" onClick={onClose} title="Đóng">
          <X size={18} />
        </button>

        <div className="logout-modal-header">
          <div className="logout-icon-wrapper">
            <LogOut size={28} />
          </div>
          <h3>Xác nhận đăng xuất</h3>
          <p>Bạn có chắc chắn muốn đăng xuất khỏi tài khoản Aura Stream không?</p>
        </div>

        <div className="logout-modal-actions">
          <button className="btn-logout-cancel" onClick={onClose}>
            Hủy
          </button>
          <button className="btn-logout-confirm" onClick={onConfirm}>
            Đăng xuất
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LogoutModal;
