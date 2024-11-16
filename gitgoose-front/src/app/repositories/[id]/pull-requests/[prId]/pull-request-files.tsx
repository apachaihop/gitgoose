'use client';

import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { Paper, Typography } from '@mui/material';
import { DiffEditor } from '@monaco-editor/react';
import { getLanguageFromFileName } from '@/utils/file-utils';

const GET_PULL_REQUEST_FILES = gql`
  query GetPullRequestFiles($repositoryId: ID!, $pullRequestId: ID!) {
    pullRequestFiles(repositoryId: $repositoryId, pullRequestId: $pullRequestId) {
      filename
      status
      additions
      deletions
      oldContent
      newContent
    }
  }
`;

export default function PullRequestFiles({
  repositoryId,
  pullRequestId,
}: {
  repositoryId: string;
  pullRequestId: string;
}) {
  const { data, loading, error } = useQuery(GET_PULL_REQUEST_FILES, {
    variables: { repositoryId, pullRequestId },
  });

  if (loading) return null;
  if (error) throw error;

  return (
    <div className="space-y-6">
      {data.pullRequestFiles.map((file: any) => (
        <Paper key={file.filename} className="p-4">
          <Typography variant="subtitle1" className="mb-4">
            {file.filename}
            <span className="ml-4 text-sm">
              <span className="text-green-600">+{file.additions}</span>
              {' '}
              <span className="text-red-600">-{file.deletions}</span>
            </span>
          </Typography>

          <div className="h-[400px]">
            <DiffEditor
              height="100%"
              language={getLanguageFromFileName(file.filename)}
              original={file.oldContent}
              modified={file.newContent}
              options={{
                readOnly: true,
                renderSideBySide: true,
                minimap: { enabled: false },
              }}
            />
          </div>
        </Paper>
      ))}
    </div>
  );
}