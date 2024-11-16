'use client';

import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TablePagination,
  Checkbox,
} from '@mui/material';
import {
  MoreVert,
  Edit,
  Block,
  Delete,
  AdminPanelSettings,
  Security,
} from '@mui/icons-material';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { formatBytes } from '@/utils/format';
import { AdminUser } from '@/types/user-management';
import UserEditDialog from './user-edit-dialog';

const GET_USERS = gql`
  query GetUsers($page: Int!, $perPage: Int!, $filters: UserFilters) {
    users(page: $page, perPage: $perPage, filters: $filters) {
      users {
        id
        name
        email
        avatarUrl
        role
        status
        createdAt
        lastLogin
        twoFactorEnabled
        repositories
        diskUsage
        teams
      }
      totalCount
    }
  }
`;

interface UserListProps {
  selectedUsers: string[];
  onSelectionChange: (users: string[]) => void;
}

export default function UserList({ selectedUsers, onSelectionChange }: UserListProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { data, loading, error } = useQuery(GET_USERS, {
    variables: {
      page: page + 1,
      perPage: rowsPerPage,
      filters: {
        // Add filters from URL params
      },
    },
  });

  if (loading || error) return null;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: AdminUser) => {
    setSelectedUser(user);
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleEditUser = () => {
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = data.users.users.map((user: AdminUser) => user.id);
      onSelectionChange(newSelected);
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectUser = (userId: string) => {
    const selectedIndex = selectedUsers.indexOf(userId);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = [...selectedUsers, userId];
    } else {
      newSelected = selectedUsers.filter(id => id !== userId);
    }

    onSelectionChange(newSelected);
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedUsers.length > 0 && selectedUsers.length < data.users.users.length}
                  checked={selectedUsers.length === data.users.users.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>User</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>2FA</TableCell>
              <TableCell>Repositories</TableCell>
              <TableCell>Storage Used</TableCell>
              <TableCell>Last Active</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.users.users.map((user: AdminUser) => (
              <TableRow key={user.id}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar src={user.avatarUrl} />
                    <div>
                      <div>{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={user.role}
                    color={user.role === 'admin' ? 'error' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={user.status}
                    color={
                      user.status === 'active'
                        ? 'success'
                        : user.status === 'suspended'
                        ? 'error'
                        : 'default'
                    }
                  />
                </TableCell>
                <TableCell>
                  {user.twoFactorEnabled ? (
                    <Chip size="small" label="Enabled" color="success" />
                  ) : (
                    <Chip size="small" label="Disabled" />
                  )}
                </TableCell>
                <TableCell>{user.repositories}</TableCell>
                <TableCell>{formatBytes(user.diskUsage)}</TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(user.lastLogin))} ago
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={(e) => handleMenuOpen(e, user)}>
                    <MoreVert />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={data.users.totalCount}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditUser}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit User</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <AdminPanelSettings fontSize="small" />
          </ListItemIcon>
          <ListItemText>Change Role</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <Security fontSize="small" />
          </ListItemIcon>
          <ListItemText>Reset 2FA</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <Block fontSize="small" />
          </ListItemIcon>
          <ListItemText>Suspend User</ListItemText>
        </MenuItem>
        <MenuItem className="text-red-600">
          <ListItemIcon>
            <Delete fontSize="small" className="text-red-600" />
          </ListItemIcon>
          <ListItemText>Delete User</ListItemText>
        </MenuItem>
      </Menu>

      {selectedUser && (
        <UserEditDialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          user={selectedUser}
        />
      )}
    </>
  );
}