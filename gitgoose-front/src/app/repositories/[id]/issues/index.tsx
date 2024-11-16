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

const GET_ISSUES = gql`
  query GetIssues($repositoryId: ID!) {
    issues(repositoryId: $repositoryId) {
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

export default function Issues({ repositoryId }: { repositoryId: string }) {
  const { data, loading, error } = useQuery(GET_ISSUES, {
    variables: { repositoryId },
  });

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error.message}</Typography>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h6">Issues</Typography>
        <Link href={`/repositories/${repositoryId}/issues/new`}>
          <Button variant="contained" color="primary">
            New Issue
          </Button>
        </Link>
      </div>

      <List>
        {data?.issues.map((issue: any) => (
          <ListItem key={issue.id}>
            <ListItemText
              primary={issue.title}
              secondary={`#${issue.id} opened by ${issue.author.name}`}
            />
          </ListItem>
        ))}
      </List>
    </div>
  );
}