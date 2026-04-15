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
import { Button } from '@douyinfe/semi-ui';
import { useActualTheme } from '../../context/Theme';
import { RefreshCw, Search } from 'lucide-react';

const DashboardHeader = ({
  getGreeting,
  greetingVisible,
  showSearchModal,
  refresh,
  loading,
  t,
}) => {
  const actualTheme = useActualTheme();
  const ICON_BUTTON_CLASS =
    '!rounded-full !border !border-white/60 !bg-white/72 !text-slate-700 shadow-sm backdrop-blur transition-colors hover:!bg-white dark:!border-white/10 dark:!bg-white/5 dark:!text-slate-100 dark:hover:!bg-white/10';

  return (
    <div
      className='mb-6 flex flex-col gap-4 rounded-[28px] border p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:flex-row md:items-center md:justify-between md:p-6'
      style={{
        borderColor:
          actualTheme === 'dark'
            ? 'rgba(255,255,255,0.10)'
            : 'var(--opencub-border-light)',
        background:
          actualTheme === 'dark'
            ? 'linear-gradient(135deg,rgba(10,18,30,0.9),rgba(13,22,37,0.82) 48%,rgba(28,40,64,0.62))'
            : 'linear-gradient(135deg,rgba(239,231,220,0.92),rgba(245,239,232,0.88) 48%,rgba(226,236,245,0.86))',
      }}
    >
      <div>
        <div
          className='inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]'
          style={{
            border:
              actualTheme === 'dark'
                ? '1px solid rgba(125, 211, 252, 0.22)'
                : '1px solid rgba(207,218,228,0.92)',
            background:
              actualTheme === 'dark'
                ? 'rgba(56, 189, 248, 0.10)'
                : 'rgba(252,249,245,0.76)',
            color: actualTheme === 'dark' ? '#bae6fd' : '#334155',
            boxShadow:
              actualTheme === 'dark'
                ? '0 10px 28px rgba(2,6,23,0.22)'
                : '0 10px 24px rgba(31,41,55,0.04)',
          }}
        >
          opencub workspace
        </div>
        <h2
          className='mt-4 text-2xl font-semibold tracking-tight text-slate-900 transition-opacity duration-1000 ease-in-out dark:text-white md:text-3xl'
          style={{ opacity: greetingVisible ? 1 : 0 }}
        >
          {getGreeting}
        </h2>
        <p className='mt-2 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-300'>
          {t('这里集中展示你的核心运营指标、请求趋势与状态信息。')}
        </p>
      </div>
      <div className='flex gap-3'>
        <Button
          type='tertiary'
          icon={<Search size={16} />}
          onClick={showSearchModal}
          className={ICON_BUTTON_CLASS}
        />
        <Button
          type='tertiary'
          icon={<RefreshCw size={16} />}
          onClick={refresh}
          loading={loading}
          className={ICON_BUTTON_CLASS}
        />
      </div>
    </div>
  );
};

export default DashboardHeader;
