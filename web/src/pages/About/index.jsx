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

import React, { useEffect, useMemo, useState } from 'react';
import { API, showError } from '../../helpers';
import { applyDocumentTitle } from '../../helpers/documentTitle';
import { marked } from 'marked';
import { Typography, Button } from '@douyinfe/semi-ui';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;
const DOCS_ENTRY_URL = '/docs';

const About = () => {
  const { t } = useTranslation();
  const [about, setAbout] = useState('');
  const [aboutLoaded, setAboutLoaded] = useState(false);

  const normalizedAbout = useMemo(() => {
    if (typeof about === 'string') {
      return about;
    }
    if (about === null || about === undefined) {
      return '';
    }
    return String(about);
  }, [about]);

  const displayAbout = async () => {
    setAbout(localStorage.getItem('about') || '');
    const res = await API.get('/api/about');
    const { success, message, data } = res.data;
    if (success) {
      const rawAbout = typeof data === 'string' ? data : data == null ? '' : String(data);
      let aboutContent = rawAbout;
      if (rawAbout !== '' && !rawAbout.startsWith('https://')) {
        aboutContent = marked.parse(rawAbout);
      }
      setAbout(aboutContent);
      localStorage.setItem('about', aboutContent);
    } else {
      showError(message);
      setAbout(t('加载关于内容失败...'));
    }
    setAboutLoaded(true);
  };

  useEffect(() => {
    applyDocumentTitle(t('关于'));
    displayAbout().then();
  }, [t]);

  return (
    <div className='mt-[72px] px-3 py-6 md:px-6 md:py-10'>
      <div className='mx-auto mb-6 flex max-w-5xl flex-wrap items-center justify-between gap-3 rounded-[28px] border border-white/60 bg-white/78 px-5 py-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/72 md:px-6'>
        <div>
          <div className='text-base font-semibold text-slate-800 dark:text-slate-100'>
            {t('站点使用文档')}
          </div>
          <div className='mt-1 text-sm text-slate-500 dark:text-slate-300'>
            {t('查看注册、充值、API Key、客户端接入和绘图工作台说明')}
          </div>
        </div>
        <Button
          theme='solid'
          type='primary'
          onClick={() => window.open(DOCS_ENTRY_URL, '_blank', 'noopener,noreferrer')}
        >
          {t('打开使用文档')}
        </Button>
      </div>
      {aboutLoaded && normalizedAbout === '' ? (
        <div className='mx-auto max-w-3xl rounded-[32px] border border-white/60 bg-white/78 p-8 text-left shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/72'>
          <Text className='!text-base !leading-7 !text-slate-500 dark:!text-slate-300'>
            {t('管理员暂时未设置任何关于内容')}
          </Text>
        </div>
      ) : (
        <>
          {normalizedAbout.startsWith('https://') ? (
            <iframe
              src={normalizedAbout}
              style={{ width: '100%', height: '100vh', border: 'none' }}
              className='overflow-hidden rounded-[28px] border border-white/60 bg-white/70 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-zinc-950/72'
            />
          ) : (
            <div
              className='mx-auto max-w-5xl rounded-[32px] border border-white/60 bg-white/78 px-6 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/72 md:px-10'
              style={{ fontSize: 'larger' }}
              dangerouslySetInnerHTML={{ __html: normalizedAbout }}
            ></div>
          )}
        </>
      )}
    </div>
  );
};

export default About;
