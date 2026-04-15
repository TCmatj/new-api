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
import Dashboard from '../../components/dashboard';
import ConsolePageShell from '../../components/layout/ConsolePageShell';

const Detail = () => (
  <ConsolePageShell
    eyebrow='opencub'
    title='控制台总览'
    description='统一查看配额、请求趋势、公告与服务状态，让高频运营信息集中在一个更清爽的工作台里。'
    contentClassName='p-4 md:p-6'
  >
    <Dashboard />
  </ConsolePageShell>
);

export default Detail;
