import React from 'react';
import { useActualTheme } from '../../context/Theme';

const ConsolePageShell = ({
  eyebrow,
  title,
  description,
  children,
  className = '',
  contentClassName = '',
  fitViewport = true,
  compactTop = false,
  centerContent = false,
}) => {
  const actualTheme = useActualTheme();

  return (
    <div
      className={`console-page-shell px-3 md:px-6 ${compactTop ? 'pt-3 md:pt-4' : 'pt-4 md:pt-6'} pb-3 md:pb-4 ${centerContent ? 'justify-center' : ''} ${className}`.trim()}
      style={{
        minHeight: fitViewport ? '100%' : 'auto',
        background:
          actualTheme === 'dark'
            ? 'linear-gradient(180deg, rgba(6,11,19,0.22) 0%, rgba(10,18,31,0.08) 100%)'
            : 'linear-gradient(180deg, rgba(248,244,238,0.74) 0%, rgba(239,244,248,0.42) 100%)',
      }}
    >
      <div
        className={`console-page-shell__content overflow-hidden rounded-[32px] p-2 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl md:p-4 ${centerContent ? 'my-auto' : ''} ${contentClassName}`.trim()}
        style={{
          minHeight: fitViewport ? '100%' : 'auto',
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
