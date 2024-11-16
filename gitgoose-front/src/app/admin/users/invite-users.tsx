'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
} from '@mui/material';
import { Add, Clear } from '@mui/icons-material';

const INVITE_USERS = gql`
  mutation InviteUsers($input: InviteUsersInput!) {
    inviteUsers(input: $input) {
      id
      email
      role
      status
    }
  }
`;

export default function InviteUsers() {
  const [open, setOpen] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');

  const [inviteUsers, { loading }] = useMutation(INVITE_USERS, {
    onCompleted: () => {
      setOpen(false);
      setEmails([]);
      setCurrentEmail('');
      setRole('user');
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleAddEmail = () => {
    if (currentEmail && !emails.includes(currentEmail)) {
      setEmails([...emails, currentEmail]);
      setCurrentEmail('');
    }
  };

  const handleRemoveEmail = (email: string) => {
    setEmails(emails.filter((e) => e !== email));
  };

  const handleInvite = async () => {
    await inviteUsers({
      variables: {
        input: {
          emails,
          role,
        },
      },
    });
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => setOpen(true)}
      >
        Invite Users
      </Button>

      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Invite Users</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          )}

          <div className="space-y-4 mt-4">
            <div className="flex gap-2">
              <TextField
                fullWidth
                label="Email address"
                value={currentEmail}
                onChange={(e) => setCurrentEmail(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddEmail();
                  }
                }}
              />
              <Button
                variant="outlined"
                onClick={handleAddEmail}
                disabled={!currentEmail}
              >
                Add
              </Button>
            </div>

            {emails.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {emails.map((email) => (
                  <Chip
                    key={email}
                    label={email}
                    onDelete={() => handleRemoveEmail(email)}
                  />
                ))}
              </div>
            )}

            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={role}
                label="Role"
                onChange={(e) => setRole(e.target.value)}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="maintainer">Maintainer</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleInvite}
            disabled={loading || emails.length === 0}
          >
            Send Invitations
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}