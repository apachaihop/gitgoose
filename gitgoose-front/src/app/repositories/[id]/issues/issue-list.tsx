'use client';

import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { 
  Card, 
  CardContent, 
  Typography, 
  Chip,
  AvatarGroup,
  Avatar,
} from '@mui/material';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Issue } from '@/types/issue';
import { formatDistanceToNow } from 'date-fns';
import { ErrorOutline, CheckCircleOutline } from '@mui/icons-material';

const GET_ISSUES = gql`
  query GetIssues($repositoryId: ID!, $state: String, $author: String, $labels: [ID!]) {
    issues(
      repositoryId: $repositoryId, 
      state: $state, 
      author: $author,
      labels: $labels
    ) {
      id
      title
      state
      priority
      number
      author {
        name
        avatarUrl
      }
      assignees {
        id
        name
        avatarUrl
      }
      labels {
        id
        name
        color
      }
      createdAt
      commentsCount
    }
  }
`;

export default function IssueList({ repositoryId }: { repositoryId: string }) {
  const searchParams = useSearchParams();
  
  const { data, loading, error } = useQuery(GET_ISSUES, {
    variables: {
      repositoryId,
      state: searchParams.get('state') || 'open',
      author: searchParams.get('author') || undefined,
      labels: searchParams.get('labels')?.split(',') || undefined,
    },
  });

  if (loading) return null;
  if (error) throw error;

  return (
    <div className="space-y-4">
      {data.issues.map((issue: Issue) => (
        <Link 
          key={issue.id} 
          href={`/repositories/${repositoryId}/issues/${issue.number}`}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardContent>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {issue.state === 'OPEN' ? (
                    <ErrorOutline className="text-green-500" />
                  ) : (
                    <CheckCircleOutline className="text-purple-500" />
                  )}
                  <div>
                    <Typography variant="h6" component="h3">
                      {issue.title}
                    </Typography>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Typography variant="body2" color="text.secondary">
                        #{issue.number} opened {formatDistanceToNow(new Date(issue.createdAt))} ago by {issue.author.name}
                      </Typography>
                      {issue.labels.map((label) => (
                        <Chip
                          key={label.id}
                          label={label.name}
                          size="small"
                          style={{ backgroundColor: label.color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {issue.assignees.length > 0 && (
                    <AvatarGroup max={3}>
                      {issue.assignees.map((assignee) => (
                        <Avatar
                          key={assignee.id}
                          src={assignee.avatarUrl}
                          alt={assignee.name}
                        />
                      ))}
                    </AvatarGroup>
                  )}
                  {issue.commentsCount > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      {issue.commentsCount} comments
                    </Typography>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}