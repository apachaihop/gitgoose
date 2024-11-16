'use client';

import { Suspense, useState } from 'react';
import { Paper } from '@mui/material';
import UserList from './user-list';
import UserFilters from './user-filters';
import BulkActions from './bulk-actions';
import UserListSkeleton from './user-list-skeleton';

export default function UsersPage() {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const handleActionComplete = () => {
    setSelectedUsers([]); // Reset selection after bulk action
  };

  return (
    <div>
      <Paper className="mb-6">
        <UserFilters />
        <BulkActions 
          selectedUsers={selectedUsers}
          onActionComplete={handleActionComplete}
        />
      </Paper>

      <Suspense fallback={<UserListSkeleton />}>
        <UserList 
          selectedUsers={selectedUsers}
          onSelectionChange={setSelectedUsers}
        />
      </Suspense>
    </div>
  );
}