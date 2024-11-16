'use client';

import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import {
  Paper,
  Typography,
  Avatar,
  TextField,
  Button,
} from '@mui/material';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import MarkdownPreview from '@/components/markdown-preview';

const GET_PULL_REQUEST_COMMENTS = gql`
  query GetPullRequestComments($repositoryId: ID!, $pullRequestId: ID!) {
    pullRequestComments(repositoryId: $repositoryId, pullRequestId: $pullRequestId) {
      id
      content
      author {
        id
        name
        avatarUrl
      }
      createdAt
    }
  }
`;

const ADD_COMMENT = gql`
  mutation AddComment($input: AddCommentInput!) {
    addComment(input: $input) {
      id
      content
    }
  }
`;

export default function PullRequestComments({
  repositoryId,
  pullRequestId,
}: {
  repositoryId: string;
  pullRequestId: string;
}) {
  const [newComment, setNewComment] = useState('');
  
  const { data, loading, error } = useQuery(GET_PULL_REQUEST_COMMENTS, {
    variables: { repositoryId, pullRequestId },
  });

  const [addComment, { loading: commenting }] = useMutation(ADD_COMMENT, {
    onCompleted: () => setNewComment(''),
    refetchQueries: ['GetPullRequestComments'],
  });

  if (loading) return null;
  if (error) throw error;

  const handleAddComment = async () => {
    await addComment({
      variables: {
        input: {
          pullRequestId,
          content: newComment,
        },
      },
    });
  };

  return (
    <div className="space-y-6">
      {data.pullRequestComments.map((comment: any) => (
        <Paper key={comment.id} className="p-4">
          <div className="flex items-start gap-4">
            <Avatar src={comment.author.avatarUrl} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Typography variant="subtitle2">
                  {comment.author.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  commented {formatDistanceToNow(new Date(comment.createdAt))} ago
                </Typography>
              </div>
              <Paper variant="outlined" className="p-4 mt-2">
                <MarkdownPreview content={comment.content} />
              </Paper>
            </div>
          </div>
        </Paper>
      ))}

      <Paper className="p-4">
        <Typography variant="subtitle1" className="mb-4">
          Add a comment
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Leave a comment..."
        />
        <div className="flex justify-end mt-4">
          <Button
            variant="contained"
            onClick={handleAddComment}
            disabled={commenting || !newComment.trim()}
          >
            Comment
          </Button>
        </div>
      </Paper>
    </div>
  );
}