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
import {
  Avatar,
  Typography,
  Card,
  Button,
  Input,
  Badge,
  Space,
} from '@douyinfe/semi-ui';
import { Copy, Users, BarChart2, TrendingUp, Gift, Zap } from 'lucide-react';
import { useActualTheme } from '../../context/Theme';

const { Text } = Typography;

const InvitationCard = ({
  t,
  userState,
  renderQuota,
  setOpenTransfer,
  affLink,
  handleAffLinkClick,
}) => {
  const actualTheme = useActualTheme();
  const incomeHeroStyle =
    actualTheme === 'dark'
      ? {
          background:
            'linear-gradient(135deg, rgba(24,52,58,0.96) 0%, rgba(14,34,39,0.94) 52%, rgba(10,24,29,0.98) 100%)',
          borderBottom: '1px solid rgba(103, 167, 158, 0.22)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
        }
      : {
          background:
            'linear-gradient(135deg, rgba(239,252,249,0.98) 0%, rgba(229,247,242,0.96) 52%, rgba(245,252,249,0.98) 100%)',
          borderBottom: '1px solid rgba(114, 187, 169, 0.24)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.82)',
        };
  const incomeTitleStyle = {
    color: actualTheme === 'dark' ? '#f0fffb' : '#155f55',
    fontSize: '16px',
  };
  const incomeValueStyle = {
    color: actualTheme === 'dark' ? '#f5fffd' : '#0f5a4f',
  };
  const incomeMetaColor =
    actualTheme === 'dark' ? 'rgba(205,244,236,0.76)' : 'rgba(41,112,98,0.74)';

  return (
    <Card className='!rounded-2xl shadow-sm border-0'>
      {/* 卡片头部 */}
      <div className='flex items-center mb-4'>
        <Avatar size='small' color='green' className='mr-3 shadow-md'>
          <Gift size={16} />
        </Avatar>
        <div>
          <Typography.Text className='text-lg font-medium'>
            {t('邀请奖励')}
          </Typography.Text>
          <div className='text-xs'>{t('邀请好友获得额外奖励')}</div>
        </div>
      </div>

      {/* 收益展示区域 */}
      <Space vertical style={{ width: '100%' }}>
        {/* 统计数据统一卡片 */}
        <Card
          className='!rounded-xl w-full overflow-hidden'
          style={{
            background:
              actualTheme === 'dark'
                ? 'rgba(14, 22, 33, 0.9)'
                : 'rgba(255, 255, 255, 0.95)',
            border:
              actualTheme === 'dark'
                ? '1px solid rgba(82, 135, 126, 0.24)'
                : '1px solid rgba(180, 224, 214, 0.82)',
            boxShadow:
              actualTheme === 'dark'
                ? '0 20px 44px rgba(2, 11, 15, 0.34)'
                : '0 18px 38px rgba(104, 174, 155, 0.16)',
          }}
          cover={
            <div
              className='relative h-30'
              style={incomeHeroStyle}
            >
              {/* 标题和按钮 */}
              <div className='relative z-10 h-full flex flex-col justify-between p-4'>
                <div className='flex justify-between items-center'>
                  <Text strong style={incomeTitleStyle}>
                    {t('收益统计')}
                  </Text>
                  <Button
                    type='primary'
                    theme='solid'
                    size='small'
                    disabled={
                      !userState?.user?.aff_quota ||
                      userState?.user?.aff_quota <= 0
                    }
                    onClick={() => setOpenTransfer(true)}
                    className='!rounded-lg'
                    style={{
                      background:
                        actualTheme === 'dark'
                          ? 'linear-gradient(135deg, #2f7e71 0%, #245d54 100%)'
                          : 'linear-gradient(135deg, #37b9a0 0%, #2f9d88 100%)',
                      border: 'none',
                      boxShadow:
                        actualTheme === 'dark'
                          ? '0 10px 24px rgba(26, 104, 93, 0.32)'
                          : '0 10px 22px rgba(55, 185, 160, 0.24)',
                    }}
                  >
                    <Zap size={12} className='mr-1' />
                    {t('划转到余额')}
                  </Button>
                </div>

                {/* 统计数据 */}
                <div className='grid grid-cols-3 gap-6 mt-4'>
                  {/* 待使用收益 */}
                  <div className='text-center'>
                    <div className='text-base sm:text-2xl font-bold mb-2' style={incomeValueStyle}>
                      {renderQuota(userState?.user?.aff_quota || 0)}
                    </div>
                    <div className='flex items-center justify-center text-sm'>
                      <TrendingUp size={14} className='mr-1' style={{ color: incomeMetaColor }} />
                      <Text style={{ color: incomeMetaColor, fontSize: '12px' }}>
                        {t('待使用收益')}
                      </Text>
                    </div>
                  </div>

                  {/* 总收益 */}
                  <div className='text-center'>
                    <div className='text-base sm:text-2xl font-bold mb-2' style={incomeValueStyle}>
                      {renderQuota(userState?.user?.aff_history_quota || 0)}
                    </div>
                    <div className='flex items-center justify-center text-sm'>
                      <BarChart2 size={14} className='mr-1' style={{ color: incomeMetaColor }} />
                      <Text style={{ color: incomeMetaColor, fontSize: '12px' }}>
                        {t('总收益')}
                      </Text>
                    </div>
                  </div>

                  {/* 邀请人数 */}
                  <div className='text-center'>
                    <div className='text-base sm:text-2xl font-bold mb-2' style={incomeValueStyle}>
                      {userState?.user?.aff_count || 0}
                    </div>
                    <div className='flex items-center justify-center text-sm'>
                      <Users size={14} className='mr-1' style={{ color: incomeMetaColor }} />
                      <Text style={{ color: incomeMetaColor, fontSize: '12px' }}>
                        {t('邀请人数')}
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        >
          {/* 邀请链接部分 */}
          <Input
            value={affLink}
            readonly
            className='!rounded-lg'
            prefix={t('邀请链接')}
            suffix={
              <Button
                type='primary'
                theme='solid'
                onClick={handleAffLinkClick}
                icon={<Copy size={14} />}
                className='!rounded-lg'
              >
                {t('复制')}
              </Button>
            }
          />
        </Card>

        {/* 奖励说明 */}
        <Card
          className='!rounded-xl w-full'
          title={<Text type='tertiary'>{t('奖励说明')}</Text>}
        >
          <div className='space-y-3'>
            <div className='flex items-start gap-2'>
              <Badge dot type='success' />
              <Text type='tertiary' className='text-sm'>
                {t('邀请好友注册，好友充值后您可获得相应奖励')}
              </Text>
            </div>

            <div className='flex items-start gap-2'>
              <Badge dot type='success' />
              <Text type='tertiary' className='text-sm'>
                {t('通过划转功能将奖励额度转入到您的账户余额中')}
              </Text>
            </div>

            <div className='flex items-start gap-2'>
              <Badge dot type='success' />
              <Text type='tertiary' className='text-sm'>
                {t('邀请的好友越多，获得的奖励越多')}
              </Text>
            </div>
          </div>
        </Card>
      </Space>
    </Card>
  );
};

export default InvitationCard;
