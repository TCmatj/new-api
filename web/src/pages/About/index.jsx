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

import React, { useEffect, useState } from 'react';
import { API, showError } from '../../helpers';
import { applyDocumentTitle } from '../../helpers/documentTitle';
import { marked } from 'marked';
import { Empty, Typography } from '@douyinfe/semi-ui';
import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import EmptyStateIcon from '../../components/common/EmptyStateIcon';

const { Text } = Typography;

const About = () => {
  const { t } = useTranslation();
  const [about, setAbout] = useState('');
  const [aboutLoaded, setAboutLoaded] = useState(false);

  const displayAbout = async () => {
    setAbout(localStorage.getItem('about') || '');
    const res = await API.get('/api/about');
    const { success, message, data } = res.data;
    if (success) {
      let aboutContent = data;
      if (!data.startsWith('https://')) {
        aboutContent = marked.parse(data);
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

  const emptyStyle = {
    padding: '24px',
  };

  const customDescription = (
    <div className='mx-auto max-w-3xl rounded-[32px] border border-white/60 bg-white/78 p-8 text-left shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/72'>
      <Text className='!text-base !leading-7 !text-slate-500 dark:!text-slate-300'>
        {t('管理员暂时未设置任何关于内容')}
      </Text>
    </div>
  );

  return (
    <div className='mt-[72px] px-3 py-6 md:px-6 md:py-10'>
      {aboutLoaded && about === '' ? (
        <div className='flex min-h-[calc(100vh-160px)] items-center justify-center p-4 md:p-8'>
          <Empty
            image={<EmptyStateIcon icon={FileText} accent='slate' />}
            description={t('管理员暂时未设置任何关于内容')}
            style={emptyStyle}
          >
            {customDescription}
          </Empty>
        </div>
      ) : (
        <>
          {about.startsWith('https://') ? (
            <iframe
              src={about}
              style={{ width: '100%', height: '100vh', border: 'none' }}
              className='overflow-hidden rounded-[28px] border border-white/60 bg-white/70 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-zinc-950/72'
            />
          ) : (
            <div
              className='mx-auto max-w-5xl rounded-[32px] border border-white/60 bg-white/78 px-6 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/72 md:px-10'
              style={{ fontSize: 'larger' }}
              dangerouslySetInnerHTML={{ __html: about }}
            ></div>
          )}
        </>
      )}
    </div>
  );
};

export default About;
