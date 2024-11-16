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
  Autocomplete,
  Chip,
  Alert,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { Editor } from '@monaco-editor/react';
import { IssueLabel, IssuePriority } from '@/types/issue';

const GET_LABELS = gql`
  query GetLabels($repositoryId: ID!) {
    labels(repositoryId: $repositoryId) {
      id
      name
      color
      description
    }
  }
`;

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      avatarUrl
    }
  }
`;

const CREATE_ISSUE = gql`
  mutation CreateIssue($input: CreateIssueInput!) {
    createIssue(input: $input) {
      id
      number
    }
  }
`;

export default function NewIssuePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<IssuePriority>('MEDIUM');
  const [selectedLabels, setSelectedLabels] = useState<IssueLabel[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<any[]>([]);
  const [error, setError] = useState('');

  const { data: labelsData } = useQuery(GET_LABELS, {
    variables: { repositoryId: params.id },
  });

  const { data: usersData } = useQuery(GET_USERS);

  const [createIssue, { loading }] = useMutation(CREATE_ISSUE, {
    onCompleted: (data) => {
      router.push(`/repositories/${params.id}/issues/${data.createIssue.number}`);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createIssue({
      variables: {
        input: {
          repositoryId: params.id,
          title,
          description,
          priority,
          labelIds: selectedLabels.map(label => label.id),
          assigneeIds: selectedAssignees.map(user => user.id),
        },
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">New Issue</h1>
      
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
              <InputLabel>Priority</InputLabel>
              <Select
                value={priority}
                label="Priority"
                onChange={(e) => setPriority(e.target.value as IssuePriority)}
              >
                <MenuItem value="LOW">Low</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="HIGH">High</MenuItem>
              </Select>
            </FormControl>

            <Autocomplete
              multiple
              fullWidth
              options={labelsData?.labels || []}
              value={selectedLabels}
              onChange={(_, newValue) => setSelectedLabels(newValue)}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField {...params} label="Labels" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option.name}
                    {...getTagProps({ index })}
                    style={{ backgroundColor: option.color }}
                  />
                ))
              }
            />

            <Autocomplete
              multiple
              fullWidth
              options={usersData?.users || []}
              value={selectedAssignees}
              onChange={(_, newValue) => setSelectedAssignees(newValue)}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField {...params} label="Assignees" />
              )}
            />
          </div>

          <div className="h-[400px]">
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
              disabled={loading || !title.trim()}
            >
              Create Issue
            </Button>
          </div>
        </Paper>
      </form>
    </div>
  );
}