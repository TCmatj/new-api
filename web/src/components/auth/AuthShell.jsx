import React from 'react';
import { Typography } from '@douyinfe/semi-ui';
import { BRAND } from '../../config/brand';
import { useActualTheme } from '../../context/Theme';

const { Text, Title } = Typography;

const AuthShell = ({
  logo,
  systemName,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'max-w-md',
}) => {
  const actualTheme = useActualTheme();

  return (
    <div
      className='relative min-h-screen overflow-hidden px-4 py-12 sm:px-6 lg:px-8'
      style={{
        background:
          actualTheme === 'dark'
            ? 'radial-gradient(circle at top, rgba(59,130,246,0.2), transparent 30%), linear-gradient(180deg, #09090b, #111827 55%, #09090b)'
            : 'radial-gradient(circle at top, rgba(215, 199, 182, 0.22), transparent 30%), linear-gradient(180deg, #f6efe7, #edf2f7 52%, #f7f1ea)',
      }}
    >
      <div className='blur-ball blur-ball-indigo' style={{ top: '-80px', right: '-80px', transform: 'none' }} />
      <div className='blur-ball blur-ball-teal' style={{ top: '50%', left: '-120px' }} />

      <div className='relative z-10 mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-6xl items-center justify-center'>
        <div className='grid w-full grid-cols-1 gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12'>
          <section
            className='hidden lg:flex flex-col justify-center rounded-[32px] p-10 shadow-[0_20px_80px_rgba(15,23,42,0.10)] backdrop-blur-xl'
            style={{
              border:
                actualTheme === 'dark'
                  ? '1px solid rgba(255,255,255,0.10)'
                  : '1px solid rgba(223, 227, 232, 0.86)',
              background:
                actualTheme === 'dark'
                  ? 'rgba(255,255,255,0.05)'
                  : 'rgba(250, 246, 241, 0.74)',
            }}
          >
            <div className='inline-flex w-fit items-center rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200'>
              {BRAND.name}
            </div>
            <Title heading={1} className='!mb-4 !mt-6 !text-5xl !leading-[1.1] !text-slate-900 dark:!text-white'>
              {systemName}
            </Title>
            <Text className='!text-lg !leading-8 !text-slate-600 dark:!text-slate-300'>
              {subtitle}
            </Text>
            <div className='mt-8 grid grid-cols-1 gap-4'>
              {[
                '统一品牌与入口',
                '更克制的视觉层次',
                '更聚焦的登录与注册体验',
              ].map((item) => (
                <div
                  key={item}
                  className='rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-4 text-sm text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200'
                >
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className={`flex flex-col justify-center ${maxWidth} w-full justify-self-center`}>
            <div className='mb-6 flex items-center justify-center gap-3 lg:hidden'>
              <img src={logo} alt='Logo' className='h-11 w-11 rounded-2xl object-cover shadow-sm ring-1 ring-black/5' />
              <div>
                <Text className='!block !text-xs !uppercase !tracking-[0.2em] !text-slate-400'>
                  {BRAND.slug}
                </Text>
                <Title heading={4} className='!mb-0 !text-slate-900 dark:!text-white'>
                  {systemName}
                </Title>
              </div>
            </div>

            <div
              className='rounded-[28px] p-3 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl'
              style={{
                border:
                  actualTheme === 'dark'
                    ? '1px solid rgba(255,255,255,0.10)'
                    : '1px solid rgba(227, 231, 236, 0.88)',
                background:
                  actualTheme === 'dark'
                    ? 'rgba(24,24,27,0.72)'
                    : 'rgba(249, 244, 237, 0.88)',
              }}
            >
              <div
                className='rounded-[22px] px-5 py-6 sm:px-6 sm:py-7'
                style={{
                  border:
                    actualTheme === 'dark'
                      ? '1px solid rgba(255,255,255,0.10)'
                      : '1px solid rgba(237, 239, 242, 0.92)',
                  background:
                    actualTheme === 'dark'
                      ? 'rgba(9, 12, 18, 0.40)'
                      : 'rgba(255,255,255,0.90)',
                }}
              >
                <div className='mb-6 flex items-center gap-3'>
                  <img src={logo} alt='Logo' className='h-11 w-11 rounded-2xl object-cover shadow-sm ring-1 ring-black/5' />
                  <div>
                    <Text className='!block !text-xs !uppercase !tracking-[0.18em] !text-slate-400'>
                      {BRAND.slug}
                    </Text>
                    <Title heading={4} className='!mb-0 !text-slate-900 dark:!text-white'>
                      {systemName}
                    </Title>
                  </div>
                </div>

                <div className='mb-6'>
                  <Title heading={3} className='!mb-2 !text-slate-900 dark:!text-white'>
                    {title}
                  </Title>
                  {subtitle ? (
                    <Text className='!text-slate-500 dark:!text-slate-300'>
                      {subtitle}
                    </Text>
                  ) : null}
                </div>

                {children}
              </div>
            </div>

            {footer ? <div className='mt-5'>{footer}</div> : null}
          </section>
        </div>
      </div>
    </div>
  );
};

export default AuthShell;
