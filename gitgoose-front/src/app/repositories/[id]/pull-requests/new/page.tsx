'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import {
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { Editor } from '@monaco-editor/react';

const GET_BRANCHES = gql`
  query GetBranches($repositoryId: ID!) {
    branches(repositoryId: $repositoryId) {
      name
      isDefault
    }
  }
`;

const CREATE_PULL_REQUEST = gql`
  mutation CreatePullRequest($input: CreatePullRequestInput!) {
    createPullRequest(createPullRequestInput: $input) {
      id
    }
  }
`;

export default function NewPullRequest({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sourceBranch, setSourceBranch] = useState('');
  const [targetBranch, setTargetBranch] = useState('');
  const [error, setError] = useState('');

  const { data: branchData } = useQuery(GET_BRANCHES, {
    variables: { repositoryId: params.id },
  });

  const [createPullRequest, { loading }] = useMutation(CREATE_PULL_REQUEST, {
    onCompleted: (data) => {
      router.push(`/repositories/${params.id}/pull-requests/${data.createPullRequest.id}`);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPullRequest({
      variables: {
        input: {
          title,
          description,
          sourceBranch,
          targetBranch,
          repositoryId: params.id,
        },
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">New Pull Request</h1>
      
      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Paper className="p-6 space-y-6">
          <TextField
            fullWidth
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="flex gap-4">
            <FormControl fullWidth>
              <InputLabel>Source Branch</InputLabel>
              <Select
                value={sourceBranch}
                label="Source Branch"
                onChange={(e) => setSourceBranch(e.target.value)}
                required
              >
                {branchData?.branches.map((branch: any) => (
                  <MenuItem key={branch.name} value={branch.name}>
                    {branch.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Target Branch</InputLabel>
              <Select
                value={targetBranch}
                label="Target Branch"
                onChange={(e) => setTargetBranch(e.target.value)}
                required
              >
                {branchData?.branches.map((branch: any) => (
                  <MenuItem key={branch.name} value={branch.name}>
                    {branch.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div className="h-[300px]">
            <Editor
              height="100%"
              defaultLanguage="markdown"
              value={description}
              onChange={(value) => setDescription(value || '')}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
              }}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button 
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              disabled={loading}
            >
              Create Pull Request
            </Button>
          </div>
        </Paper>
      </form>
    </div>
  );
}