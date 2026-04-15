import React from 'react';
import { useActualTheme } from '../../context/Theme';

const EmptyStateIcon = ({
  icon: Icon,
  size = 30,
  className = '',
  accent = 'slate',
}) => {
  const actualTheme = useActualTheme();

  const accentMap = {
    slate: {
      lightIcon: '#475569',
      darkIcon: '#e2e8f0',
      lightGlow: 'rgba(148,163,184,0.18)',
      darkGlow: 'rgba(71,85,105,0.28)',
    },
    blue: {
      lightIcon: '#2563eb',
      darkIcon: '#93c5fd',
      lightGlow: 'rgba(59,130,246,0.16)',
      darkGlow: 'rgba(59,130,246,0.26)',
    },
    amber: {
      lightIcon: '#d97706',
      darkIcon: '#fbbf24',
      lightGlow: 'rgba(245,158,11,0.16)',
      darkGlow: 'rgba(245,158,11,0.24)',
    },
    emerald: {
      lightIcon: '#059669',
      darkIcon: '#6ee7b7',
      lightGlow: 'rgba(16,185,129,0.16)',
      darkGlow: 'rgba(16,185,129,0.24)',
    },
    rose: {
      lightIcon: '#e11d48',
      darkIcon: '#fda4af',
      lightGlow: 'rgba(244,63,94,0.16)',
      darkGlow: 'rgba(244,63,94,0.22)',
    },
  };

  const palette = accentMap[accent] || accentMap.slate;
  const isDark = actualTheme === 'dark';

  return (
    <div
      className={`mx-auto flex items-center justify-center rounded-[26px] backdrop-blur-sm ${className}`}
      style={{
        width: 92,
        height: 92,
        background: isDark
          ? 'linear-gradient(135deg, rgba(10,18,30,0.9), rgba(18,28,45,0.82))'
          : 'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(244,238,230,0.92))',
        border: isDark
          ? '1px solid rgba(148,163,184,0.22)'
          : '1px solid rgba(226,232,240,0.9)',
        boxShadow: isDark
          ? `0 16px 36px ${palette.darkGlow}`
          : `0 14px 32px ${palette.lightGlow}`,
      }}
    >
      <div
        className='flex items-center justify-center rounded-2xl'
        style={{
          width: 56,
          height: 56,
          background: isDark
            ? 'linear-gradient(135deg, rgba(30,41,59,0.92), rgba(15,23,42,0.76))'
            : 'linear-gradient(135deg, rgba(248,250,252,0.96), rgba(241,245,249,0.94))',
          color: isDark ? palette.darkIcon : palette.lightIcon,
          boxShadow: isDark
            ? 'inset 0 1px 0 rgba(255,255,255,0.05)'
            : 'inset 0 1px 0 rgba(255,255,255,0.72)',
        }}
      >
        <Icon size={size} strokeWidth={2} />
      </div>
    </div>
  );
};

export default EmptyStateIcon;
