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
import NewYearButton from './NewYearButton';
import NotificationButton from './NotificationButton';
import ThemeToggle from './ThemeToggle';
import LanguageSelector from './LanguageSelector';
import UserArea from './UserArea';

const ActionButtons = ({
  isNewYear,
  unreadCount,
  onNoticeOpen,
  theme,
  actualTheme,
  onThemeToggle,
  currentLang,
  onLanguageChange,
  userState,
  isLoading,
  isMobile,
  isSelfUseMode,
  logout,
  navigate,
  t,
}) => {
  return (
    <div
      className='flex items-center gap-2 rounded-full px-2 py-2 backdrop-blur-md md:gap-3 md:px-3'
      style={{
        border:
          actualTheme === 'dark'
            ? '1px solid rgba(255,255,255,0.10)'
            : '1px solid rgba(222,226,231,0.72)',
        background:
          actualTheme === 'dark'
            ? 'linear-gradient(135deg, rgba(10,18,30,0.88) 0%, rgba(18,29,45,0.82) 100%)'
            : 'rgba(252,248,243,0.84)',
        boxShadow:
          actualTheme === 'dark'
            ? '0 14px 34px rgba(0,0,0,0.22)'
            : '0 10px 30px rgba(31,41,55,0.04)',
      }}
    >
      <NewYearButton isNewYear={isNewYear} />

      <NotificationButton
        unreadCount={unreadCount}
        onNoticeOpen={onNoticeOpen}
        t={t}
      />

      <ThemeToggle theme={theme} onThemeToggle={onThemeToggle} t={t} />

      <LanguageSelector
        currentLang={currentLang}
        onLanguageChange={onLanguageChange}
        t={t}
      />

      <UserArea
        userState={userState}
        isLoading={isLoading}
        isMobile={isMobile}
        isSelfUseMode={isSelfUseMode}
        logout={logout}
        navigate={navigate}
        t={t}
      />
    </div>
  );
};

export default ActionButtons;
