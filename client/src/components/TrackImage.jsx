import React, { useState } from 'react';
import { Music } from 'lucide-react';

const TrackImage = ({ src, alt = 'Track', className = '', style = {} }) => {
  const [hasError, setHasError] = useState(!src);

  const getGradient = (text) => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h1 = Math.abs(hash % 360);
    const h2 = (h1 + 50) % 360;
    return `linear-gradient(135deg, hsl(${h1}, 70%, 35%), hsl(${h2}, 80%, 15%))`;
  };

  if (hasError) {
    const fallbackBg = getGradient(alt);
    return (
      <div
        className={`fallback-track-image ${className}`}
        style={{
          background: fallbackBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#f3f4f6',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          ...style
        }}
      >
        <Music size="40%" style={{ opacity: 0.6 }} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{
        objectFit: 'cover',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        ...style
      }}
      onError={() => setHasError(true)}
    />
  );
};

export default TrackImage;
