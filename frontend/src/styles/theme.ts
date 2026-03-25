export const theme = {
  colors: {
    background: '#020204',
    secondaryBackground: '#050508',
    cardBackground: 'rgba(10, 10, 15, 0.3)',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.6)',
    accentPrimary: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
    accentSecondary: 'linear-gradient(135deg, #7028e4 0%, #e5b2ca 100%)',
    border: 'rgba(255, 255, 255, 0.06)',
    success: '#00ffa3',
    danger: '#ff2e63',
    warning: '#ffc107',
    info: '#00d2ff',
    glass: 'rgba(255, 255, 255, 0.015)',
    mesh: 'radial-gradient(at 0% 0%, rgba(0, 242, 254, 0.15) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(112, 40, 228, 0.15) 0, transparent 50%)',
    holographic: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0) 100%)',
  },
  shadows: {
    card: '0 20px 50px rgba(0, 0, 0, 0.5)',
    glow: '0 0 30px rgba(0, 242, 254, 0.2)',
    inner: 'inset 0 1px 1px rgba(255, 255, 255, 0.05)',
    neon: '0 0 15px rgba(0, 242, 254, 0.4)'
  },
  borderRadius: {
    small: '16px',
    medium: '24px',
    large: '40px',
    xlarge: '60px'
  },
  transitions: {
    ultra: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
    default: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    fast: 'all 0.2s ease-out'
  }
};

export type ThemeType = typeof theme;
