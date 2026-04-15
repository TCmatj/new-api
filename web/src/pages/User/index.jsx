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
import UsersTable from '../../components/table/users';
import ConsolePageShell from '../../components/layout/ConsolePageShell';

const User = () => {
  return (
    <ConsolePageShell
      eyebrow='users'
      title='用户管理'
      description='统一查看账户、权限与状态信息，让运维和日常支持工作更顺手。'
    >
      <UsersTable />
    </ConsolePageShell>
  );
};

export default User;
