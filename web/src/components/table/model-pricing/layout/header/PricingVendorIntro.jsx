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

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import {
  Card,
  Tag,
  Avatar,
  Typography,
  Tooltip,
  Modal,
} from '@douyinfe/semi-ui';
import { getLobeHubIcon } from '../../../../../helpers';
import SearchActions from './SearchActions';
import { useActualTheme } from '../../../../../context/Theme';

const { Paragraph } = Typography;

const CONFIG = {
  CAROUSEL_INTERVAL: 2000,
  ICON_SIZE: 40,
  UNKNOWN_VENDOR: 'unknown',
};

const THEME_COLORS = {
  allVendors: {
    primary: '93 107 128',
    background: 'rgba(148, 163, 184, 0.14)',
  },
  specific: {
    primary: '120 113 108',
    background: 'rgba(226, 232, 240, 0.92)',
  },
};

const COMPONENT_STYLES = {
  tag: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    color: '#1f2937',
    border: '1px solid rgba(226,232,240,0.9)',
    fontWeight: '500',
  },
  avatarContainer:
    'w-16 h-16 rounded-2xl bg-white/92 shadow-md backdrop-blur-sm flex items-center justify-center border border-slate-200/70 dark:bg-[rgba(15,23,42,0.82)] dark:border-slate-700/70',
  titleText: { color: '#0f172a' },
  descriptionText: { color: 'rgba(51, 65, 85, 0.88)' },
  darkTitleText: { color: 'rgba(248, 250, 252, 0.98)' },
  darkDescriptionText: { color: 'rgba(224, 232, 240, 0.95)' },
  darkTag: {
    backgroundColor: 'rgba(15,23,42,0.58)',
    color: 'rgba(248,250,252,0.98)',
    border: '1px solid rgba(100,116,139,0.82)',
    fontWeight: '500',
  },
};

const CONTENT_TEXTS = {
  unknown: {
    displayName: (t) => t('未知供应商'),
    description: (t) =>
      t(
        '包含来自未知或未标明供应商的AI模型，这些模型可能来自小型供应商或开源项目。',
      ),
  },
  all: {
    description: (t) =>
      t('查看所有可用的AI模型供应商，包括众多知名供应商的模型。'),
  },
  fallback: {
    description: (t) => t('该供应商提供多种AI模型，适用于不同的应用场景。'),
  },
};

const getVendorDisplayName = (vendorName, t) => {
  return vendorName === CONFIG.UNKNOWN_VENDOR
    ? CONTENT_TEXTS.unknown.displayName(t)
    : vendorName;
};

const createDefaultAvatar = (actualTheme) => (
  <div
    className='w-16 h-16 rounded-2xl flex items-center justify-center backdrop-blur-sm'
    style={{
      background:
        actualTheme === 'dark'
          ? 'linear-gradient(135deg, rgba(12,20,32,0.92) 0%, rgba(20,31,47,0.88) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.94) 0%, rgba(246,241,235,0.92) 100%)',
      border:
        actualTheme === 'dark'
          ? '1px solid rgba(100,116,139,0.42)'
          : '1px solid rgba(226,232,240,0.82)',
      boxShadow:
        actualTheme === 'dark'
          ? '0 14px 32px rgba(2,6,23,0.28)'
          : '0 12px 28px rgba(148,163,184,0.16)',
    }}
  >
    <Avatar size='large' color='transparent'>
      AI
    </Avatar>
  </div>
);

const getAvatarBackgroundColor = (isAllVendors) =>
  isAllVendors
    ? THEME_COLORS.allVendors.background
    : THEME_COLORS.specific.background;

const getAvatarText = (vendorName) =>
  vendorName === CONFIG.UNKNOWN_VENDOR
    ? '?'
    : vendorName.charAt(0).toUpperCase();

const createAvatarContent = (vendor, isAllVendors) => {
  if (vendor.icon) {
    return getLobeHubIcon(vendor.icon, CONFIG.ICON_SIZE);
  }

  return (
    <Avatar
      size='large'
      style={{ backgroundColor: getAvatarBackgroundColor(isAllVendors) }}
    >
      {getAvatarText(vendor.name)}
    </Avatar>
  );
};

const renderVendorAvatar = (
  vendor,
  t,
  actualTheme,
  isAllVendors = false,
) => {
  if (!vendor) {
    return createDefaultAvatar(actualTheme);
  }

  const displayName = getVendorDisplayName(vendor.name, t);
  const avatarContent = createAvatarContent(vendor, isAllVendors);

  return (
    <Tooltip content={displayName} position='top'>
      <div
        className='w-16 h-16 rounded-2xl flex items-center justify-center backdrop-blur-sm'
        style={{
          background:
            actualTheme === 'dark'
              ? 'linear-gradient(135deg, rgba(12,20,32,0.92) 0%, rgba(20,31,47,0.88) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.94) 0%, rgba(246,241,235,0.92) 100%)',
          border:
            actualTheme === 'dark'
              ? '1px solid rgba(100,116,139,0.42)'
              : '1px solid rgba(226,232,240,0.82)',
          boxShadow:
            actualTheme === 'dark'
              ? '0 14px 32px rgba(2,6,23,0.28)'
              : '0 12px 28px rgba(148,163,184,0.16)',
        }}
      >
        {avatarContent}
      </div>
    </Tooltip>
  );
};

const PricingVendorIntro = memo(
  ({
    filterVendor,
    models = [],
    allModels = [],
    t,
    selectedRowKeys = [],
    copyText,
    handleChange,
    handleCompositionStart,
    handleCompositionEnd,
    isMobile = false,
    searchValue = '',
    setShowFilterModal,
    showWithRecharge,
    setShowWithRecharge,
    currency,
    setCurrency,
    showRatio,
    setShowRatio,
    viewMode,
    setViewMode,
    tokenUnit,
    setTokenUnit,
  }) => {
    const actualTheme = useActualTheme();
    const [currentOffset, setCurrentOffset] = useState(0);
    const [descModalVisible, setDescModalVisible] = useState(false);
    const [descModalContent, setDescModalContent] = useState('');

    const handleOpenDescModal = useCallback((content) => {
      setDescModalContent(content || '');
      setDescModalVisible(true);
    }, []);

    const handleCloseDescModal = useCallback(() => {
      setDescModalVisible(false);
    }, []);

    const renderDescriptionModal = useCallback(
      () => (
        <Modal
          title={t('供应商介绍')}
          visible={descModalVisible}
          onCancel={handleCloseDescModal}
          footer={null}
          width={isMobile ? '95%' : 600}
          bodyStyle={{
            maxHeight: isMobile ? '70vh' : '60vh',
            overflowY: 'auto',
          }}
        >
          <div className='text-sm mb-4'>{descModalContent}</div>
        </Modal>
      ),
      [descModalVisible, descModalContent, handleCloseDescModal, isMobile, t],
    );

    const vendorInfo = useMemo(() => {
      const vendors = new Map();
      let unknownCount = 0;

      const sourceModels =
        Array.isArray(allModels) && allModels.length > 0 ? allModels : models;

      sourceModels.forEach((model) => {
        if (model.vendor_name) {
          const existing = vendors.get(model.vendor_name);
          if (existing) {
            existing.count++;
          } else {
            vendors.set(model.vendor_name, {
              name: model.vendor_name,
              icon: model.vendor_icon,
              description: model.vendor_description,
              count: 1,
            });
          }
        } else {
          unknownCount++;
        }
      });

      const vendorList = Array.from(vendors.values()).sort((a, b) =>
        a.name.localeCompare(b.name),
      );

      if (unknownCount > 0) {
        vendorList.push({
          name: CONFIG.UNKNOWN_VENDOR,
          icon: null,
          description: CONTENT_TEXTS.unknown.description(t),
          count: unknownCount,
        });
      }

      return vendorList;
    }, [allModels, models, t]);

    const currentModelCount = models.length;

    useEffect(() => {
      if (filterVendor !== 'all' || vendorInfo.length <= 1) {
        setCurrentOffset(0);
        return;
      }

      const interval = setInterval(() => {
        setCurrentOffset((prev) => (prev + 1) % vendorInfo.length);
      }, CONFIG.CAROUSEL_INTERVAL);

      return () => clearInterval(interval);
    }, [filterVendor, vendorInfo.length]);

    const getVendorDescription = useCallback(
      (vendorKey) => {
        if (vendorKey === 'all') {
          return CONTENT_TEXTS.all.description(t);
        }
        if (vendorKey === CONFIG.UNKNOWN_VENDOR) {
          return CONTENT_TEXTS.unknown.description(t);
        }
        const vendor = vendorInfo.find((v) => v.name === vendorKey);
        return vendor?.description || CONTENT_TEXTS.fallback.description(t);
      },
      [vendorInfo, t],
    );

    const createCoverStyle = useCallback(
      (primaryColor) => ({
        '--palette-primary-darkerChannel': primaryColor,
        backgroundImage: `linear-gradient(135deg, rgba(241,245,249,0.98) 0%, rgba(232,238,245,0.96) 52%, rgba(var(--palette-primary-darkerChannel) / 0.22) 100%)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        borderBottom: '1px solid rgba(226, 232, 240, 0.9)',
      }),
      [],
    );

    const createDarkCoverStyle = useCallback(
      (primaryColor) => ({
        '--palette-primary-darkerChannel': primaryColor,
        backgroundImage: 'var(--opencub-vendor-dark)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        borderBottom: '1px solid rgba(51, 65, 85, 0.82)',
      }),
      [],
    );

    const renderSearchActions = useCallback(
      () => (
        <SearchActions
          selectedRowKeys={selectedRowKeys}
          copyText={copyText}
          handleChange={handleChange}
          handleCompositionStart={handleCompositionStart}
          handleCompositionEnd={handleCompositionEnd}
          isMobile={isMobile}
          searchValue={searchValue}
          setShowFilterModal={setShowFilterModal}
          showWithRecharge={showWithRecharge}
          setShowWithRecharge={setShowWithRecharge}
          currency={currency}
          setCurrency={setCurrency}
          showRatio={showRatio}
          setShowRatio={setShowRatio}
          viewMode={viewMode}
          setViewMode={setViewMode}
          tokenUnit={tokenUnit}
          setTokenUnit={setTokenUnit}
          t={t}
        />
      ),
      [
        selectedRowKeys,
        copyText,
        handleChange,
        handleCompositionStart,
        handleCompositionEnd,
        isMobile,
        searchValue,
        setShowFilterModal,
        showWithRecharge,
        setShowWithRecharge,
        currency,
        setCurrency,
        showRatio,
        setShowRatio,
        viewMode,
        setViewMode,
        tokenUnit,
        setTokenUnit,
        t,
      ],
    );

    const renderHeaderCard = useCallback(
      ({ title, count, description, rightContent, primaryDarkerChannel }) => {
        const isDark = actualTheme === 'dark';
        const titleStyle = isDark
          ? COMPONENT_STYLES.darkTitleText
          : COMPONENT_STYLES.titleText;
        const descriptionStyle = isDark
          ? COMPONENT_STYLES.darkDescriptionText
          : COMPONENT_STYLES.descriptionText;
        const tagStyle = isDark
          ? COMPONENT_STYLES.darkTag
          : COMPONENT_STYLES.tag;

        return (
          <Card
            className='!rounded-2xl shadow-sm border-0'
            cover={
              <div className='relative h-full'>
                <div
                  className='absolute inset-0'
                  style={
                    isDark
                      ? createDarkCoverStyle(primaryDarkerChannel)
                      : createCoverStyle(primaryDarkerChannel)
                  }
                />
                <div className='relative z-10 h-full flex items-center justify-between p-4'>
                  <div className='flex-1 min-w-0 mr-4'>
                    <div className='flex flex-row flex-wrap items-center gap-2 sm:gap-3 mb-2'>
                      <h2
                        className='text-lg sm:text-xl font-bold truncate'
                        style={titleStyle}
                      >
                        {title}
                      </h2>
                      <Tag
                        style={tagStyle}
                        shape='circle'
                        size='small'
                        className='self-center'
                      >
                        {t('共 {{count}} 个模型', { count })}
                      </Tag>
                    </div>
                    <Paragraph
                      className='text-xs sm:text-sm leading-relaxed !mb-0 cursor-pointer'
                      style={descriptionStyle}
                      ellipsis={{ rows: 2 }}
                      onClick={() => handleOpenDescModal(description)}
                    >
                      {description}
                    </Paragraph>
                  </div>

                  <div className='flex-shrink-0'>{rightContent}</div>
                </div>
              </div>
            }
          >
            {renderSearchActions()}
          </Card>
        );
      },
      [actualTheme, renderSearchActions, createCoverStyle, createDarkCoverStyle, handleOpenDescModal, t],
    );

    const renderAllVendorsAvatar = useCallback(() => {
      const currentVendor =
        vendorInfo.length > 0
          ? vendorInfo[currentOffset % vendorInfo.length]
          : null;
      return renderVendorAvatar(currentVendor, t, actualTheme, true);
    }, [vendorInfo, currentOffset, t, actualTheme]);

    if (filterVendor === 'all') {
      const headerCard = renderHeaderCard({
        title: t('全部供应商'),
        count: currentModelCount,
        description: getVendorDescription('all'),
        rightContent: renderAllVendorsAvatar(),
        primaryDarkerChannel: THEME_COLORS.allVendors.primary,
      });
      return (
        <>
          {headerCard}
          {renderDescriptionModal()}
        </>
      );
    }

    const currentVendor = vendorInfo.find((v) => v.name === filterVendor);
    if (!currentVendor) {
      return null;
    }

    const vendorDisplayName = getVendorDisplayName(currentVendor.name, t);

    const headerCard = renderHeaderCard({
      title: vendorDisplayName,
      count: currentModelCount,
      description:
        currentVendor.description || getVendorDescription(currentVendor.name),
      rightContent: renderVendorAvatar(currentVendor, t, actualTheme, false),
      primaryDarkerChannel: THEME_COLORS.specific.primary,
    });

    return (
      <>
        {headerCard}
        {renderDescriptionModal()}
      </>
    );
  },
);

PricingVendorIntro.displayName = 'PricingVendorIntro';

export default PricingVendorIntro;
