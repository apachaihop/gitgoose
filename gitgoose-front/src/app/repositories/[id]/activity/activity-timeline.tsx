'use client';

import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import {
  Paper,
  Typography,
  Avatar,
  Link,
  Button,
  CircularProgress,
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import {
  AccountTree,
  BugReport,
  Comment,
  Commit,
  ForkRight,
  LocalOffer,
  MergeType,
  RateReview
} from '@mui/icons-material';
import { Activity, ActivityType } from '@/types/activity';
import { useSearchParams } from 'next/navigation';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';

const GET_ACTIVITY = gql`
  query GetActivity($repositoryId: ID!, $cursor: String, $types: [ActivityType!], $search: String) {
    activity(
      repositoryId: $repositoryId,
      after: $cursor,
      types: $types,
      search: $search
    ) {
      edges {
        node {
          id
          type
          actor {
            id
            name
            avatarUrl
          }
          timestamp
          payload {
            title
            description
            status
            sha
            ref
            action
            number
            url
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const ACTIVITY_ICONS: Record<ActivityType, React.ReactNode> = {
  COMMIT: <Commit />,
  PULL_REQUEST: <MergeType />,
  ISSUE: <BugReport />,
  RELEASE: <LocalOffer />,
  FORK: <ForkRight />,
  BRANCH: <AccountTree />,
  COMMENT: <Comment />,
  REVIEW: <RateReview />,
};

export default function ActivityTimeline({ repositoryId }: { repositoryId: string }) {
  const searchParams = useSearchParams();
  const { ref, inView } = useInView();

  const { data, loading, error, fetchMore } = useQuery(GET_ACTIVITY, {
    variables: { 
      repositoryId,
      types: searchParams.get('types')?.split(',') || undefined,
      search: searchParams.get('q') || undefined,
    },
  });

  useEffect(() => {
    if (inView && data?.activity.pageInfo.hasNextPage) {
      fetchMore({
        variables: {
          cursor: data.activity.pageInfo.endCursor,
        },
      });
    }
  }, [inView, data, fetchMore]);

  if (error) throw error;

  const renderActivityContent = (activity: Activity) => {
    switch (activity.type) {
      case 'COMMIT':
        return (
          <div>
            <Typography variant="subtitle2">
              Committed{' '}
              <Link href={activity.payload.url} className="hover:underline">
                {activity.payload.sha?.slice(0, 7)}
              </Link>
            </Typography>
            <Typography variant="body2">{activity.payload.description}</Typography>
          </div>
        );

      case 'PULL_REQUEST':
        return (
          <div>
            <Typography variant="subtitle2">
              {activity.payload.action} pull request{' '}
              <Link href={activity.payload.url} className="hover:underline">
                #{activity.payload.number}
              </Link>
            </Typography>
            <Typography variant="body2">{activity.payload.title}</Typography>
          </div>
        );

      // Add cases for other activity types...

      default:
        return (
          <Typography variant="body2">
            {activity.payload.description || activity.payload.title}
          </Typography>
        );
    }
  };

  return (
    <Paper className="p-4">
      <div className="space-y-6">
        {data?.activity.edges.map(({ node: activity }: { node: Activity }) => (
          <div key={activity.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <Avatar src={activity.actor.avatarUrl} />
              <div className="flex-1 w-px bg-gray-200 my-2" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {ACTIVITY_ICONS[activity.type]}
                <Typography variant="subtitle1" className="font-medium">
                  {activity.actor.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDistanceToNow(new Date(activity.timestamp))} ago
                </Typography>
              </div>
              
              {renderActivityContent(activity)}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-center p-4">
            <CircularProgress />
          </div>
        )}

        <div ref={ref} />
      </div>
    </Paper>
  );
}