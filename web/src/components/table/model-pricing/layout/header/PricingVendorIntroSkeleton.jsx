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

import React, { memo } from 'react';
import { Card, Skeleton } from '@douyinfe/semi-ui';

const THEME_COLORS = {
  allVendors: {
    primary: '93 107 128',
    background: 'rgba(148, 163, 184, 0.12)',
    border: 'rgba(148, 163, 184, 0.22)',
  },
  specific: {
    primary: '120 113 108',
    background: 'rgba(226, 232, 240, 0.9)',
    border: 'rgba(203, 213, 225, 0.95)',
  },
  neutral: {
    background: 'rgba(203, 213, 225, 0.22)',
    border: 'rgba(203, 213, 225, 0.38)',
  },
};

const SIZES = {
  title: { width: { all: 120, specific: 100 }, height: 24 },
  tag: { width: 80, height: 20 },
  description: { height: 14 },
  avatar: { width: 40, height: 40 },
  searchInput: { height: 32 },
  button: { width: 80, height: 32 },
};

const SKELETON_STYLES = {
  cover: (primaryColor) => ({
    '--palette-primary-darkerChannel': primaryColor,
    backgroundImage: `linear-gradient(135deg, rgba(241,245,249,0.98) 0%, rgba(232,238,245,0.96) 52%, rgba(var(--palette-primary-darkerChannel) / 0.22) 100%)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    borderBottom: '1px solid rgba(226, 232, 240, 0.9)',
  }),
  darkCover: () => ({
    backgroundImage: 'linear-gradient(135deg, rgba(14, 23, 38, 0.98) 0%, rgba(21, 34, 52, 0.96) 52%, rgba(71, 85, 105, 0.34) 100%)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    borderBottom: '1px solid rgba(51, 65, 85, 0.82)',
  }),
  title: {
    backgroundColor: 'rgba(148, 163, 184, 0.18)',
    borderRadius: 8,
    backdropFilter: 'blur(4px)',
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderRadius: 9999,
    backdropFilter: 'blur(4px)',
    border: '1px solid rgba(226,232,240,0.9)',
  },
  description: {
    backgroundColor: 'rgba(148, 163, 184, 0.14)',
    borderRadius: 4,
    backdropFilter: 'blur(4px)',
  },
  avatar: (isAllVendors) => {
    const colors = isAllVendors
      ? THEME_COLORS.allVendors
      : THEME_COLORS.specific;
    return {
      backgroundColor: colors.background,
      borderRadius: 12,
      border: `1px solid ${colors.border}`,
    };
  },
  searchInput: {
    backgroundColor: THEME_COLORS.neutral.background,
    borderRadius: 8,
    border: `1px solid ${THEME_COLORS.neutral.border}`,
  },
  button: {
    backgroundColor: THEME_COLORS.neutral.background,
    borderRadius: 8,
    border: `1px solid ${THEME_COLORS.neutral.border}`,
  },
};

const createSkeletonRect = (style = {}, key = null) => (
  <div key={key} className='animate-pulse' style={style} />
);

const PricingVendorIntroSkeleton = memo(
  ({ isAllVendors = false, isMobile = false }) => {
    const placeholder = (
      <Card
        className='!rounded-2xl shadow-sm border-0'
        cover={
          <div className='relative h-full'>
            <div
              className='absolute inset-0 dark:hidden'
              style={SKELETON_STYLES.cover(
                isAllVendors
                  ? THEME_COLORS.allVendors.primary
                  : THEME_COLORS.specific.primary,
              )}
            />
            <div
              className='absolute inset-0 hidden dark:block'
              style={SKELETON_STYLES.darkCover()}
            />
            <div className='relative z-10 h-full flex items-center justify-between p-4'>
              <div className='flex-1 min-w-0 mr-4'>
                <div className='flex flex-row flex-wrap items-center gap-2 sm:gap-3 mb-2'>
                  {createSkeletonRect(
                    {
                      ...SKELETON_STYLES.title,
                      width: isAllVendors
                        ? SIZES.title.width.all
                        : SIZES.title.width.specific,
                      height: SIZES.title.height,
                    },
                    'title',
                  )}
                  {createSkeletonRect(
                    {
                      ...SKELETON_STYLES.tag,
                      width: SIZES.tag.width,
                      height: SIZES.tag.height,
                    },
                    'tag',
                  )}
                </div>
                <div className='space-y-2'>
                  {createSkeletonRect(
                    {
                      ...SKELETON_STYLES.description,
                      width: '100%',
                      height: SIZES.description.height,
                    },
                    'desc1',
                  )}
                  {createSkeletonRect(
                    {
                      ...SKELETON_STYLES.description,
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      width: '75%',
                      height: SIZES.description.height,
                    },
                    'desc2',
                  )}
                </div>
              </div>

              <div className='flex-shrink-0 w-16 h-16 rounded-2xl bg-white/92 shadow-md backdrop-blur-sm flex items-center justify-center border border-slate-200/70'>
                {createSkeletonRect(
                  {
                    ...SKELETON_STYLES.avatar(isAllVendors),
                    width: SIZES.avatar.width,
                    height: SIZES.avatar.height,
                  },
                  'avatar',
                )}
              </div>
            </div>
          </div>
        }
      >
        <div className='flex items-center gap-2 w-full'>
          <div className='flex-1'>
            {createSkeletonRect(
              {
                ...SKELETON_STYLES.searchInput,
                width: '100%',
                height: SIZES.searchInput.height,
              },
              'search',
            )}
          </div>

          {createSkeletonRect(
            {
              ...SKELETON_STYLES.button,
              width: SIZES.button.width,
              height: SIZES.button.height,
            },
            'copy-button',
          )}

          {isMobile &&
            createSkeletonRect(
              {
                ...SKELETON_STYLES.button,
                width: SIZES.button.width,
                height: SIZES.button.height,
              },
              'filter-button',
            )}
        </div>
      </Card>
    );

    return (
      <Skeleton loading={true} active placeholder={placeholder}></Skeleton>
    );
  },
);

PricingVendorIntroSkeleton.displayName = 'PricingVendorIntroSkeleton';

export default PricingVendorIntroSkeleton;
