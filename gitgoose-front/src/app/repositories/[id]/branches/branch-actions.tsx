'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
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
} from '@mui/material';

const GET_BRANCHES = gql`
  query GetBranches($repositoryId: ID!) {
    branches(repositoryId: $repositoryId) {
      name
      isDefault
    }
  }
`;

const CREATE_BRANCH = gql`
  mutation CreateBranch($input: CreateBranchInput!) {
    createBranch(input: $input) {
      name
    }
  }
`;

export default function BranchActions({ repositoryId }: { repositoryId: string }) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [sourceBranch, setSourceBranch] = useState('');
  const [error, setError] = useState('');

  const { data: branchesData } = useQuery(GET_BRANCHES, {
    variables: { repositoryId },
  });

  const [createBranch, { loading }] = useMutation(CREATE_BRANCH, {
    onCompleted: () => {
      setCreateDialogOpen(false);
      setNewBranchName('');
      setSourceBranch('');
    },
    onError: (error) => {
      setError(error.message);
    },
    refetchQueries: ['GetBranches'],
  });

  const handleCreateBranch = async () => {
    await createBranch({
      variables: {
        input: {
          repositoryId,
          name: newBranchName,
          sourceBranch,
        },
      },
    });
  };

  return (
    <>
      <Button
        variant="contained"
        onClick={() => setCreateDialogOpen(true)}
      >
        New Branch
      </Button>

      <Dialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Branch</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" className="mb-4 mt-2">
              {error}
            </Alert>
          )}
          
          <div className="space-y-4 mt-4">
            <TextField
              fullWidth
              label="Branch name"
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              required
            />

            <FormControl fullWidth>
              <InputLabel>Source branch</InputLabel>
              <Select
                value={sourceBranch}
                label="Source branch"
                onChange={(e) => setSourceBranch(e.target.value)}
                required
              >
                {branchesData?.branches.map((branch: any) => (
                  <MenuItem key={branch.name} value={branch.name}>
                    {branch.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateBranch}
            disabled={loading || !newBranchName || !sourceBranch}
          >
            Create Branch
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}