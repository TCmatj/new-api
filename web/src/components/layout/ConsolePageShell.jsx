import React from 'react';
import { useActualTheme } from '../../context/Theme';

const ConsolePageShell = ({
  eyebrow,
  title,
  description,
  children,
  className = '',
  contentClassName = '',
}) => {
  const actualTheme = useActualTheme();

  return (
    <div
      className={`mt-[72px] px-3 py-6 md:px-6 md:py-8 ${className}`.trim()}
      style={{
        background:
          actualTheme === 'dark'
            ? 'linear-gradient(180deg, rgba(6,11,19,0.22) 0%, rgba(10,18,31,0.08) 100%)'
            : 'linear-gradient(180deg, rgba(248,244,238,0.74) 0%, rgba(239,244,248,0.42) 100%)',
      }}
    >
      <div
        className={`overflow-hidden rounded-[32px] p-2 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl md:p-4 ${contentClassName}`.trim()}
        style={{
          border: actualTheme === 'dark' ? '1px solid rgba(255,255,255,0.10)' : '1px solid var(--opencub-border-light)',
          background: actualTheme === 'dark' ? 'var(--opencub-dark-surface)' : 'var(--opencub-light-surface)',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ConsolePageShell;
