import { useState, useEffect } from 'react';

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const types = {
    success: {
      backgroundColor: '#34a853',
      icon: '✓',
    },
    error: {
      backgroundColor: '#ea4335',
      icon: '✕',
    },
    info: {
      backgroundColor: '#4285f4',
      icon: 'ℹ',
    },
    warning: {
      backgroundColor: '#f9ab00',
      icon: '⚠',
    },
  };

  const config = types[type] || types.info;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: config.backgroundColor,
        color: 'white',
        padding: '16px 24px',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 10001,
        minWidth: '300px',
        maxWidth: '500px',
        transform: isVisible ? 'translateX(0)' : 'translateX(120%)',
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.3s ease-out',
      }}
      role="alert"
      aria-live="polite"
    >
      <span
        style={{
          fontSize: '20px',
          fontWeight: '700',
        }}
      >
        {config.icon}
      </span>
      <span
        style={{
          fontSize: '15px',
          fontWeight: '500',
          flex: 1,
        }}
      >
        {message}
      </span>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          fontSize: '20px',
          cursor: 'pointer',
          padding: '0',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};

export default Toast;
