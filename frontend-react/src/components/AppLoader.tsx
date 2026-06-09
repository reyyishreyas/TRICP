import { useEffect, useState } from 'react';

export function AppLoader() {
  const [hidden, setHidden] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHidden(true);
      setTimeout(() => setVisible(false), 600);
    }, 1400);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        transition: 'opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1), transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
        opacity: hidden ? 0 : 1,
        transform: hidden ? 'scale(1.03)' : 'scale(1)',
        pointerEvents: hidden ? 'none' : 'all',
      }}
    >
      {/* Logo mark */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          overflow: 'hidden',
          marginBottom: 28,
          boxShadow: '0 8px 30px hsl(211 100% 48% / 0.25)',
          animation: 'loaderPulse 1.8s ease-in-out infinite',
          flexShrink: 0,
        }}
      >
        <img src="/logo.png" alt="TRICP" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>

      {/* Brand name */}
      <div style={{
        fontSize: 22,
        fontWeight: 800,
        color: '#0f1c2e',
        letterSpacing: '-0.6px',
        marginBottom: 4,
        fontFamily: 'Inter, -apple-system, sans-serif',
      }}>
        TRICP
      </div>
      <div style={{
        fontSize: 12,
        color: '#8b99b0',
        letterSpacing: '0.02em',
        marginBottom: 36,
        fontFamily: 'Inter, -apple-system, sans-serif',
      }}>
        Telecom Retention Intelligence &amp; Churn Predictor
      </div>

      {/* Loading bars */}
      <div style={{ display: 'flex', gap: 5, alignItems: 'flex-end', height: 24 }}>
        {[0, 0.15, 0.3, 0.45, 0.6].map((delay, i) => (
          <div
            key={i}
            style={{
              width: 4,
              borderRadius: 2,
              background: i === 2 ? 'hsl(199,89%,46%)' : 'hsl(211,100%,48%)',
              animation: `loaderBar 1.2s ease-in-out ${delay}s infinite`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes loaderBar {
          0%, 100% { height: 8px; opacity: 0.35; }
          50% { height: 24px; opacity: 1; }
        }
        @keyframes loaderPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 8px 30px hsl(211 100% 48% / 0.3); }
          50% { transform: scale(1.06); box-shadow: 0 12px 40px hsl(211 100% 48% / 0.45); }
        }
      `}</style>
    </div>
  );
}
