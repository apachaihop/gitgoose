'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import {
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { useRouter } from 'next/navigation';

const DELETE_REPOSITORY = gql`
  mutation DeleteRepository($id: ID!) {
    deleteRepository(id: $id)
  }
`;

export default function DangerZone({ repositoryId, repositoryName }: {
  repositoryId: string;
  repositoryName: string;
}) {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const router = useRouter();
  const [deleteRepository] = useMutation(DELETE_REPOSITORY);

  const handleDelete = async () => {
    if (confirmation === repositoryName) {
      try {
        await deleteRepository({
          variables: { id: repositoryId },
        });
        router.push('/repositories');
      } catch (error) {
        console.error('Failed to delete repository:', error);
      }
    }
  };

  return (
    <Paper className="p-4 border border-red-500 mt-8">
      <Typography variant="h6" color="error">
        Danger Zone
      </Typography>
      <Button
        color="error"
        variant="outlined"
        onClick={() => setOpen(true)}
        className="mt-4"
      >
        Delete Repository
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Delete Repository</DialogTitle>
        <DialogContent>
          <Typography>
            This action cannot be undone. Please type <strong>{repositoryName}</strong> to confirm.
          </Typography>
          <TextField
            fullWidth
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            color="error"
            disabled={confirmation !== repositoryName}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}