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
import ModelsTable from '../../components/table/models';
import ConsolePageShell from '../../components/layout/ConsolePageShell';

const ModelPage = () => {
  return (
    <ConsolePageShell
      eyebrow='models'
      title='模型管理'
      description='在统一界面中维护模型、能力边界与展示策略，减少配置页的碎片感。'
    >
      <ModelsTable />
    </ConsolePageShell>
  );
};

export default ModelPage;
