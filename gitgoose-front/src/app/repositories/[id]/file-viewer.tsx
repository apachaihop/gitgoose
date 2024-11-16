'use client';

import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { Paper } from '@mui/material';
import { Editor } from '@monaco-editor/react';
import { getLanguageFromFileName } from '@/utils/file-utils';

const GET_FILE_CONTENT = gql`
  query GetFileContent($repositoryId: String!, $path: String!) {
    getFileContent(repositoryId: $repositoryId, path: $path)
  }
`;

interface FileViewerProps {
  repositoryId: string;
  path: string;
}

export default function FileViewer({ repositoryId, path }: FileViewerProps) {
  const { data, loading, error } = useQuery(GET_FILE_CONTENT, {
    variables: { repositoryId, path },
  });

  if (loading) return null;
  if (error) throw error;

  const language = getLanguageFromFileName(path);

  return (
    <Paper className="h-[600px]">
      <Editor
        height="100%"
        defaultLanguage={language}
        defaultValue={data.getFileContent}
        options={{
          readOnly: true,
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
        }}
      />
    </Paper>
  );
}