'use client';

import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { 
  Card, 
  CardContent, 
  Typography, 
  Avatar, 
  Chip,
  AvatarGroup,
} from '@mui/material';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PullRequest } from '@/types/pull-request';
import { formatDistanceToNow } from 'date-fns';

const GET_PULL_REQUESTS = gql`
  query GetPullRequests($repositoryId: ID!, $state: String, $author: String) {
    pullRequests(repositoryId: $repositoryId, state: $state, author: $author) {
      id
      title
      state
      author {
        name
        avatarUrl
      }
      reviewers {
        name
        avatarUrl
      }
      createdAt
      updatedAt
      comments
      commits
    }
  }
`;

export default function PullRequestList({ repositoryId }: { repositoryId: string }) {
  const searchParams = useSearchParams();
  
  const { data, loading, error } = useQuery(GET_PULL_REQUESTS, {
    variables: {
      repositoryId,
      state: searchParams.get('state') || 'open',
      author: searchParams.get('author') || undefined,
    },
  });

  if (loading) return null;
  if (error) throw error;

  return (
    <div className="space-y-4">
      {data.pullRequests.map((pr: PullRequest) => (
        <Link 
          key={pr.id} 
          href={`/repositories/${repositoryId}/pull-requests/${pr.id}`}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardContent>
              <div className="flex items-start justify-between">
                <div>
                  <Typography variant="h6" component="h3">
                    {pr.title}
                  </Typography>
                  <div className="flex items-center gap-2 mt-2">
                    <Chip 
                      label={pr.state.toLowerCase()} 
                      color={
                        pr.state === 'OPEN' ? 'success' : 
                        pr.state === 'MERGED' ? 'primary' : 
                        'default'
                      }
                      size="small"
                    />
                    <Typography variant="body2" color="text.secondary">
                      #{pr.id} opened {formatDistanceToNow(new Date(pr.createdAt))} ago by {pr.author.name}
                    </Typography>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <AvatarGroup max={3}>
                    {pr.reviewers.map((reviewer) => (
                      <Avatar 
                        key={reviewer.id} 
                        src={reviewer.avatarUrl}
                        alt={reviewer.name}
                      />
                    ))}
                  </AvatarGroup>
                  <div className="text-right">
                    <Typography variant="body2" color="text.secondary">
                      {pr.comments} comments
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {pr.commits} commits
                    </Typography>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}