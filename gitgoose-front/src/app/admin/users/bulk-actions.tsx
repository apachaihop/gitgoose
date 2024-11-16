'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import {
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

const BULK_UPDATE_USERS = gql`
  mutation BulkUpdateUsers($input: BulkUpdateUsersInput!) {
    bulkUpdateUsers(input: $input) {
      count
      success
    }
  }
`;

export default function BulkActions({ selectedUsers, onActionComplete }: {
  selectedUsers: string[];
  onActionComplete: () => void;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [action, setAction] = useState<string | null>(null);

  const [bulkUpdateUsers] = useMutation(BULK_UPDATE_USERS);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAction = async () => {
    try {
      await bulkUpdateUsers({
        variables: {
          input: {
            userIds: selectedUsers,
            action: action,
          },
        },
      });
      onActionComplete();
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
    setConfirmDialog(false);
    handleClose();
  };

  return (
    <>
      <Button
        variant="outlined"
        onClick={handleClick}
        disabled={selectedUsers.length === 0}
      >
        Bulk Actions
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={() => {
          setAction('deactivate');
          setConfirmDialog(true);
        }}>
          Deactivate Selected
        </MenuItem>
        <MenuItem onClick={() => {
          setAction('delete');
          setConfirmDialog(true);
        }}>
          Delete Selected
        </MenuItem>
      </Menu>

      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          Are you sure you want to {action} the selected users?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>Cancel</Button>
          <Button onClick={handleAction} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}