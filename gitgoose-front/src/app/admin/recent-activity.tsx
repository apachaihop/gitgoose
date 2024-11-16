'use client';

import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  CircularProgress,
} from '@mui/material';

const GET_RECENT_ACTIVITY = gql`
  query GetRecentActivity {
    recentActivity {
      id
      type
      description
      createdAt
      user {
        name
      }
    }
  }
`;

export default function RecentActivity() {
  const { data, loading, error } = useQuery(GET_RECENT_ACTIVITY);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error.message}</Typography>;

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Recent Activity
      </Typography>
      <List>
        {data?.recentActivity.map((activity: any) => (
          <ListItem key={activity.id}>
            <ListItemText
              primary={activity.description}
              secondary={`${activity.user.name} - ${new Date(
                activity.createdAt
              ).toLocaleString()}`}
            />
          </ListItem>
        ))}
      </List>
    </div>
  );
}