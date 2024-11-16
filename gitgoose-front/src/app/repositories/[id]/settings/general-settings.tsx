'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import {
  Paper,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

const GET_REPOSITORY_SETTINGS = gql`
  query GetRepositorySettings($repositoryId: ID!) {
    repository(id: $repositoryId) {
      id
      name
      description
      isPrivate
      defaultBranch
      allowMergeCommits
      allowSquashMerging
      allowRebaseMerging
      deleteBranchOnMerge
      enableIssues
      enableProjects
      enableDiscussions
    }
    branches(repositoryId: $repositoryId) {
      name
      isDefault
    }
  }
`;

const UPDATE_REPOSITORY_SETTINGS = gql`
  mutation UpdateRepositorySettings($input: UpdateRepositorySettingsInput!) {
    updateRepositorySettings(input: $input) {
      id
      name
      description
      isPrivate
    }
  }
`;

export default function GeneralSettings({ repositoryId }: { repositoryId: string }) {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data, loading } = useQuery(GET_REPOSITORY_SETTINGS, {
    variables: { repositoryId },
  });

  const [updateSettings, { loading: updating }] = useMutation(UPDATE_REPOSITORY_SETTINGS, {
    onCompleted: () => {
      setSuccess('Settings updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  if (loading) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    await updateSettings({
      variables: {
        input: {
          repositoryId,
          name: formData.get('name'),
          description: formData.get('description'),
          isPrivate: formData.get('isPrivate') === 'true',
          defaultBranch: formData.get('defaultBranch'),
          allowMergeCommits: formData.get('allowMergeCommits') === 'true',
          allowSquashMerging: formData.get('allowSquashMerging') === 'true',
          allowRebaseMerging: formData.get('allowRebaseMerging') === 'true',
          deleteBranchOnMerge: formData.get('deleteBranchOnMerge') === 'true',
          enableIssues: formData.get('enableIssues') === 'true',
          enableProjects: formData.get('enableProjects') === 'true',
          enableDiscussions: formData.get('enableDiscussions') === 'true',
        },
      },
    });
  };

  return (
    <Paper className="p-6">
      <Typography variant="h6" className="mb-4">
        General Settings
      </Typography>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" className="mb-4">
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <TextField
          fullWidth
          name="name"
          label="Repository name"
          defaultValue={data.repository.name}
          required
        />

        <TextField
          fullWidth
          name="description"
          label="Description"
          defaultValue={data.repository.description}
          multiline
          rows={3}
        />

        <FormControl fullWidth>
          <InputLabel>Default branch</InputLabel>
          <Select
            name="defaultBranch"
            label="Default branch"
            defaultValue={data.repository.defaultBranch}
          >
            {data.branches.map((branch: any) => (
              <MenuItem key={branch.name} value={branch.name}>
                {branch.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <div className="space-y-2">
          <FormControlLabel
            control={
              <Switch
                name="isPrivate"
                defaultChecked={data.repository.isPrivate}
              />
            }
            label="Private repository"
          />

          <FormControlLabel
            control={
              <Switch
                name="allowMergeCommits"
                defaultChecked={data.repository.allowMergeCommits}
              />
            }
            label="Allow merge commits"
          />

          <FormControlLabel
            control={
              <Switch
                name="allowSquashMerging"
                defaultChecked={data.repository.allowSquashMerging}
              />
            }
            label="Allow squash merging"
          />

          <FormControlLabel
            control={
              <Switch
                name="allowRebaseMerging"
                defaultChecked={data.repository.allowRebaseMerging}
              />
            }
            label="Allow rebase merging"
          />

          <FormControlLabel
            control={
              <Switch
                name="deleteBranchOnMerge"
                defaultChecked={data.repository.deleteBranchOnMerge}
              />
            }
            label="Automatically delete head branches"
          />

          <FormControlLabel
            control={
              <Switch
                name="enableIssues"
                defaultChecked={data.repository.enableIssues}
              />
            }
            label="Enable issues"
          />

          <FormControlLabel
            control={
              <Switch
                name="enableProjects"
                defaultChecked={data.repository.enableProjects}
              />
            }
            label="Enable projects"
          />

          <FormControlLabel
            control={
              <Switch
                name="enableDiscussions"
                defaultChecked={data.repository.enableDiscussions}
              />
            }
            label="Enable discussions"
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="contained"
            disabled={updating}
          >
            Save changes
          </Button>
        </div>
      </form>
    </Paper>
  );
}