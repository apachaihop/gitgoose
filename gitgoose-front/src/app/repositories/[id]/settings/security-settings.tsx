'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import {
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  Alert,
  TextField,
} from '@mui/material';

const GET_SECURITY_SETTINGS = gql`
  query GetSecuritySettings($repositoryId: ID!) {
    repository(id: $repositoryId) {
      id
      requireApprovalForMerge
      requiredApprovalsCount
    }
  }
`;

const UPDATE_SECURITY_SETTINGS = gql`
  mutation UpdateSecuritySettings($input: UpdateSecuritySettingsInput!) {
    updateSecuritySettings(input: $input) {
      id
      requireApprovalForMerge
      requiredApprovalsCount
    }
  }
`;

export default function SecuritySettings({ repositoryId }: { repositoryId: string }) {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data, loading } = useQuery(GET_SECURITY_SETTINGS, {
    variables: { repositoryId },
  });

  const [updateSettings, { loading: updating }] = useMutation(UPDATE_SECURITY_SETTINGS, {
    onCompleted: () => {
      setSuccess('Security settings updated successfully');
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
          requireApprovalForMerge: formData.get('requireApprovalForMerge') === 'true',
          requiredApprovalsCount: parseInt(formData.get('requiredApprovalsCount') as string),
        },
      },
    });
  };

  return (
    <Paper className="p-6">
      <Typography variant="h6" className="mb-4">
        Security Settings
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
        <div className="space-y-4">
          <FormControlLabel
            control={
              <Switch
                name="requireApprovalForMerge"
                defaultChecked={data.repository.requireApprovalForMerge}
              />
            }
            label="Require pull request reviews before merging"
          />

          {data.repository.requireApprovalForMerge && (
            <TextField
              type="number"
              name="requiredApprovalsCount"
              label="Required number of approvals"
              defaultValue={data.repository.requiredApprovalsCount}
              inputProps={{ min: 1 }}
            />
          )}
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="contained"
            disabled={updating}
          >
            Save security settings
          </Button>
        </div>
      </form>
    </Paper>
  );
}