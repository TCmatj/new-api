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
import MjLogsTable from '../../components/table/mj-logs';
import ConsolePageShell from '../../components/layout/ConsolePageShell';

const Midjourney = () => (
  <ConsolePageShell
    eyebrow='midjourney'
    title='Midjourney 记录'
    description='统一查看绘图任务、生成状态与执行历史，保证视觉体验和控制台其余页面一致。'
  >
    <MjLogsTable />
  </ConsolePageShell>
);

export default Midjourney;
