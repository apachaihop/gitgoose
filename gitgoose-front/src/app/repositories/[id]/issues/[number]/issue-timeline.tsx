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

const GET_ISSUE_TIMELINE = gql`
  query GetIssueTimeline($repositoryId: ID!, $number: Int!) {
    issueTimeline(repositoryId: $repositoryId, number: $number) {
      id
      type
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

export default function IssueTimeline({
  repositoryId,
  issueNumber,
}: {
  repositoryId: string;
  issueNumber: string;
}) {
  const [newComment, setNewComment] = useState('');
  
  const { data, loading, error } = useQuery(GET_ISSUE_TIMELINE, {
    variables: { 
      repositoryId, 
      number: parseInt(issueNumber) 
    },
  });

  const [addComment, { loading: commenting }] = useMutation(ADD_COMMENT, {
    onCompleted: () => setNewComment(''),
    refetchQueries: ['GetIssueTimeline'],
  });

  if (loading) return null;
  if (error) throw error;

  const handleAddComment = async () => {
    await addComment({
      variables: {
        input: {
          issueId: data.issue.id,
          content: newComment,
        },
      },
    });
  };

  return (
    <div className="space-y-6">
      {data.issueTimeline.map((event: any) => (
        <Paper key={event.id} className="p-4">
          <div className="flex items-start gap-4">
            <Avatar src={event.author.avatarUrl} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Typography variant="subtitle2">
                  {event.author.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDistanceToNow(new Date(event.createdAt))} ago
                </Typography>
              </div>
              {event.type === 'COMMENT' ? (
                <Paper variant="outlined" className="p-4 mt-2">
                  <MarkdownPreview content={event.content} />
                </Paper>
              ) : (
                <Typography color="text.secondary" className="mt-2">
                  {event.content}
                </Typography>
              )}
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