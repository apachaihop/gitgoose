'use client';

import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Button,
  CircularProgress,
} from '@mui/material';
import Link from 'next/link';

const GET_PULL_REQUESTS = gql`
  query GetPullRequests($repositoryId: ID!) {
    pullRequests(repositoryId: $repositoryId) {
      id
      title
      state
      createdAt
      author {
        name
      }
    }
  }
`;

export default function PullRequests({ repositoryId }: { repositoryId: string }) {
  const { data, loading, error } = useQuery(GET_PULL_REQUESTS, {
    variables: { repositoryId },
  });

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error.message}</Typography>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h6">Pull Requests</Typography>
        <Link href={`/repositories/${repositoryId}/pull-requests/new`}>
          <Button variant="contained" color="primary">
            New Pull Request
          </Button>
        </Link>
      </div>

      <List>
        {data?.pullRequests.map((pr: any) => (
          <ListItem key={pr.id}>
            <ListItemText
              primary={pr.title}
              secondary={`#${pr.id} opened by ${pr.author.name}`}
            />
          </ListItem>
        ))}
      </List>
    </div>
  );
}