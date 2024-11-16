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
  Switch,
  FormControlLabel,
} from '@mui/material';
import { useRouter } from 'next/navigation';

const CREATE_REPOSITORY = gql`
  mutation CreateRepository($input: CreateRepoInput!) {
    createRepo(createRepoInput: $input) {
      id
      name
    }
  }
`;

export default function CreateRepositoryButton() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const router = useRouter();

  const [createRepository, { loading }] = useMutation(CREATE_REPOSITORY, {
    onCompleted: (data) => {
      router.push(`/repositories/${data.createRepo.id}`);
      router.refresh();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createRepository({
      variables: {
        input: {
          name,
          description,
          isPrivate,
          defaultBranch: 'main',
        },
      },
    });
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpen(true)}
      >
        New Repository
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Create a new repository</DialogTitle>
          <DialogContent>
            <div className="space-y-4 mt-4">
              <TextField
                fullWidth
                label="Repository name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <TextField
                fullWidth
                label="Description (optional)"
                multiline
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                  />
                }
                label="Private repository"
              />
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              Create repository
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}