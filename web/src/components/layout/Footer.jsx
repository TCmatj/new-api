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
import { getFooterHTML } from '../../helpers';

const FooterBar = () => {
  const [footer, setFooter] = useState(getFooterHTML());

  const loadFooter = () => {
    let footer_html = localStorage.getItem('footer_html');
    if (footer_html) {
      setFooter(footer_html);
    }
  };


  useEffect(() => {
    loadFooter();
  }, []);

  return (
    <div className='w-full'>
      {footer ? (
        <footer className='relative mx-auto flex h-auto w-full max-w-[1680px] items-center justify-center overflow-hidden rounded-[32px] border border-black/5 bg-[rgba(247,242,235,0.78)] px-6 py-5 shadow-[0_20px_60px_rgba(31,41,55,0.06)] backdrop-blur-2xl dark:border-white/10 dark:bg-[rgba(7,12,20,0.8)] md:px-16'>
          <div
            className='custom-footer na-cb6feafeb3990c78 text-sm text-slate-500 dark:text-slate-300'
            dangerouslySetInnerHTML={{ __html: footer }}
          ></div>
        </footer>
      ) : null}
    </div>
  );
};

export default FooterBar;
