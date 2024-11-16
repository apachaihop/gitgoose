'use client';

import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { Repository } from '@/types/repository';
import {
  Typography,
  Tabs,
  Tab,
  Paper,
  Button,
} from '@mui/material';
import { useState } from 'react';
import FileExplorer from './file-explorer';
import PullRequests from './pull-requests';
import Issues from './issues';

const GET_REPOSITORY = gql`
  query GetRepository($id: ID!) {
    repository(id: $id) {
      id
      name
      description
      isPrivate
      defaultBranch
      owner {
        id
        name
      }
    }
  }
`;

export default function RepositoryDetail({ id }: { id: string }) {
  const { data, loading, error } = useQuery(GET_REPOSITORY, {
    variables: { id },
  });
  const [currentTab, setCurrentTab] = useState(0);

  if (loading) return null; // Handled by Suspense
  if (error) throw error; // Handled by error boundary

  const repo: Repository = data.repository;

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <Typography variant="h4" component="h1">
            {repo.name}
          </Typography>
          {repo.description && (
            <Typography color="text.secondary" className="mt-2">
              {repo.description}
            </Typography>
          )}
        </div>
        <Button variant="contained">Clone</Button>
      </div>

      <Paper className="mb-6">
        <Tabs value={currentTab} onChange={(_, v) => setCurrentTab(v)}>
          <Tab label="Code" />
          <Tab label="Pull Requests" />
          <Tab label="Issues" />
        </Tabs>
      </Paper>

      {currentTab === 0 && <FileExplorer repositoryId={id} />}
      {currentTab === 1 && <PullRequests repositoryId={id} />}
      {currentTab === 2 && <Issues repositoryId={id} />}
    </div>
  );
}