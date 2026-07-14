import React, { useState } from 'react';

const ArtistImage = ({ src, name = 'Artist', className = '', size = '100%', style = {} }) => {
  const [hasError, setHasError] = useState(!src);

  const getGradient = (text) => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h1 = Math.abs(hash % 360);
    const h2 = (h1 + 60) % 360;
    return `linear-gradient(135deg, hsl(${h1}, 65%, 40%), hsl(${h2}, 75%, 20%))`;
  };

  const initial = name ? name.trim().charAt(0).toUpperCase() : '?';

  if (hasError) {
    const fallbackBg = getGradient(name);
    return (
      <div
        className={`fallback-artist-image ${className}`}
        style={{
          background: fallbackBg,
          width: size,
          height: size,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontWeight: '700',
          fontSize: '2rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
          userSelect: 'none',
          ...style
        }}
      >
        <span>{initial}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        objectFit: 'cover',
        boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
        ...style
      }}
      onError={() => setHasError(true)}
    />
  );
};

export default ArtistImage;
