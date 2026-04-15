/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import React from 'react';
import { Link } from 'react-router-dom';
import { Typography, Tag } from '@douyinfe/semi-ui';
import SkeletonWrapper from '../components/SkeletonWrapper';
import { useActualTheme } from '../../../context/Theme';

const HeaderLogo = ({
  isMobile,
  isConsoleRoute,
  logo,
  logoLoaded,
  isLoading,
  systemName,
  isSelfUseMode,
  isDemoSiteMode,
  t,
}) => {
  const actualTheme = useActualTheme();

  if (isMobile && isConsoleRoute) {
    return null;
  }

  const logoBadgeStyle = {
    background:
      actualTheme === 'dark'
        ? 'linear-gradient(135deg, #132033 0%, #22344b 100%)'
        : 'linear-gradient(135deg, #efe2d1 0%, #d7e7f3 100%)',
    color: actualTheme === 'dark' ? '#cfe3ff' : '#9a6b2f',
    textShadow:
      actualTheme === 'dark'
        ? '0 0 14px rgba(148, 197, 255, 0.28)'
        : '0 1px 0 rgba(255,255,255,0.35)',
  };

  const logoShellStyle = {
    border:
      actualTheme === 'dark'
        ? '1px solid rgba(104, 126, 154, 0.28)'
        : '1px solid rgba(222, 226, 231, 0.72)',
    background:
      actualTheme === 'dark'
        ? 'linear-gradient(135deg, rgba(13, 21, 34, 0.86) 0%, rgba(22, 34, 52, 0.82) 100%)'
        : 'linear-gradient(135deg, rgba(252, 248, 243, 0.92) 0%, rgba(244, 238, 231, 0.88) 100%)',
    boxShadow:
      actualTheme === 'dark'
        ? '0 10px 30px rgba(0, 0, 0, 0.22)'
        : '0 10px 30px rgba(28, 37, 56, 0.04)',
  };

  const workspaceTextStyle = {
    color: actualTheme === 'dark' ? 'rgba(148, 163, 184, 0.92)' : '#94a3b8',
  };

  return (
    <Link to='/' className='group flex items-center'>
      <div
        className='hidden md:flex items-center gap-3 rounded-full px-3 py-2 backdrop-blur'
        style={logoShellStyle}
      >
        <div
          className='flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-semibold uppercase tracking-[0.22em]'
          style={logoBadgeStyle}
        >
          OC
        </div>
        <div className='flex min-w-0 items-center gap-2'>
          <SkeletonWrapper
            loading={isLoading}
            type='title'
            width={120}
            height={24}
          >
            <div className='flex flex-col'>
              <Typography.Title
                heading={5}
                className='!mb-0 !text-[15px] !font-semibold !tracking-[0.08em]'
                style={{ color: actualTheme === 'dark' ? '#f3f7fd' : '#1f2937' }}
              >
                {systemName}
              </Typography.Title>
              <span
                className='text-[11px] uppercase tracking-[0.2em]'
                style={workspaceTextStyle}
              >
                workspace
              </span>
            </div>
          </SkeletonWrapper>
          {(isSelfUseMode || isDemoSiteMode) && !isLoading && (
            <Tag
              color='grey'
              className='rounded-full border border-black/6 !bg-white/70 px-2 py-0.5 text-[11px] whitespace-nowrap !text-slate-600 shadow-none dark:border-white/10 dark:!bg-white/5 dark:!text-slate-300'
              size='small'
              shape='circle'
            >
              {isSelfUseMode ? t('自用模式') : t('演示站点')}
            </Tag>
          )}
        </div>
      </div>

      <div
        className='flex h-10 w-10 items-center justify-center rounded-full border border-black/6 text-xs font-semibold uppercase tracking-[0.24em] shadow-[0_10px_30px_rgba(28,37,56,0.08)] dark:border-white/10 md:hidden'
        style={logoBadgeStyle}
      >
        OC
      </div>
    </Link>
  );
};

export default HeaderLogo;
