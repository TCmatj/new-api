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
import SkeletonWrapper from '../components/SkeletonWrapper';

const Navigation = ({
  mainNavLinks,
  isMobile,
  isLoading,
  userState,
  pricingRequireAuth,
  actualTheme,
}) => {
  const renderNavLinks = () => {
    const baseClasses =
      'flex-shrink-0 flex items-center gap-1 rounded-full font-medium text-slate-600 transition-all duration-200 ease-in-out dark:text-slate-300';
    const hoverClasses =
      'hover:bg-[rgba(252,248,242,0.98)] hover:text-[#8a6742] hover:shadow-[0_8px_22px_rgba(205,184,158,0.12)] dark:hover:bg-[#182233] dark:hover:text-slate-100';
    const spacingClasses = isMobile ? 'px-3 py-2' : 'px-4 py-2.5';

    const commonLinkClasses = `${baseClasses} ${spacingClasses} ${hoverClasses}`;

    return mainNavLinks.map((link) => {
      const linkContent = <span>{link.text}</span>;

      if (link.isExternal) {
        return (
          <a
            key={link.itemKey}
            href={link.externalLink}
            target='_blank'
            rel='noopener noreferrer'
            className={commonLinkClasses}
          >
            {linkContent}
          </a>
        );
      }

      let targetPath = link.to;
      if (link.itemKey === 'console' && !userState.user) {
        targetPath = '/login';
      }
      if (link.itemKey === 'pricing' && pricingRequireAuth && !userState.user) {
        targetPath = '/login';
      }

      return (
        <Link key={link.itemKey} to={targetPath} className={commonLinkClasses}>
          {linkContent}
        </Link>
      );
    });
  };

  return (
    <nav
      className='mx-1 flex flex-1 items-center gap-2 overflow-x-auto whitespace-nowrap rounded-[28px] px-2 py-2 shadow-[0_10px_30px_rgba(28,37,56,0.03)] scrollbar-hide md:mx-0 lg:gap-2'
      style={{
        border:
          actualTheme === 'dark'
            ? '1px solid rgba(255,255,255,0.10)'
            : '1px solid rgba(232,235,239,0.88)',
        background:
          actualTheme === 'dark'
            ? 'linear-gradient(135deg, rgba(11,19,31,0.88) 0%, rgba(20,31,47,0.82) 100%)'
            : 'linear-gradient(135deg, rgba(255,252,248,0.96) 0%, rgba(249,245,239,0.92) 100%)',
        boxShadow:
          actualTheme === 'dark'
            ? '0 14px 34px rgba(0,0,0,0.22)'
            : '0 10px 30px rgba(28,37,56,0.03)',
      }}
    >
      <SkeletonWrapper
        loading={isLoading}
        type='navigation'
        count={4}
        width={60}
        height={16}
        isMobile={isMobile}
      >
        {renderNavLinks()}
      </SkeletonWrapper>
    </nav>
  );
};

export default Navigation;
