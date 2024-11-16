'use client';

import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { useState } from 'react';
import { Paper, Breadcrumbs, Link, Typography, IconButton } from '@mui/material';
import { 
  FolderOutlined, 
  InsertDriveFileOutlined, 
  ArrowUpward,
  CloudUpload
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import FileUploadDialog from './file-upload-dialog';

const GET_REPOSITORY_FILES = gql`
  query GetRepositoryFiles($input: FileTreeRequestDto!) {
    getRepositoryFiles(
      repositoryId: $input.repoId,
      ref: $input.ref,
      path: $input.path
    ) {
      path
      type
      content
      size
    }
  }
`;

export default function FileExplorer({ repositoryId }: { repositoryId: string }) {
  const [currentPath, setCurrentPath] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const { data, loading, error } = useQuery(GET_REPOSITORY_FILES, {
    variables: {
      input: {
        repoId: repositoryId,
        path: currentPath,
      },
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setSelectedFiles(acceptedFiles);
      setUploadDialogOpen(true);
    },
  });

  if (loading) return null;
  if (error) throw error;

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
  };

  const pathParts = currentPath.split('/').filter(Boolean);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Breadcrumbs>
          <Link 
            href="#" 
            onClick={() => handleNavigate('')}
            className="hover:underline cursor-pointer"
          >
            root
          </Link>
          {pathParts.map((part, index) => (
            <Link
              key={part}
              href="#"
              onClick={() => handleNavigate(pathParts.slice(0, index + 1).join('/'))}
              className="hover:underline cursor-pointer"
            >
              {part}
            </Link>
          ))}
        </Breadcrumbs>
        <IconButton onClick={() => setUploadDialogOpen(true)}>
          <CloudUpload />
        </IconButton>
      </div>

      <Paper
        {...getRootProps()}
        className={`p-4 ${isDragActive ? 'bg-blue-50' : ''}`}
      >
        <input {...getInputProps()} />
        
        {currentPath && (
          <div 
            className="flex items-center p-2 hover:bg-gray-50 cursor-pointer"
            onClick={() => handleNavigate(currentPath.split('/').slice(0, -1).join('/'))}
          >
            <ArrowUpward className="mr-2" />
            <Typography>..</Typography>
          </div>
        )}

        {data.getRepositoryFiles.map((file: any) => (
          <div 
            key={file.path}
            className="flex items-center p-2 hover:bg-gray-50 cursor-pointer"
            onClick={() => file.type === 'directory' ? handleNavigate(file.path) : null}
          >
            {file.type === 'directory' ? (
              <FolderOutlined className="mr-2 text-yellow-600" />
            ) : (
              <InsertDriveFileOutlined className="mr-2 text-gray-600" />
            )}
            <Typography>{file.path.split('/').pop()}</Typography>
            {file.type === 'file' && (
              <Typography variant="caption" className="ml-2 text-gray-500">
                {formatFileSize(file.size)}
              </Typography>
            )}
          </div>
        ))}

        {isDragActive && (
          <div className="absolute inset-0 bg-blue-50 bg-opacity-50 flex items-center justify-center">
            <Typography>Drop files here...</Typography>
          </div>
        )}
      </Paper>

      <FileUploadDialog
        open={uploadDialogOpen}
        onClose={() => {
          setUploadDialogOpen(false);
          setSelectedFiles([]);
        }}
        files={selectedFiles}
        repositoryId={repositoryId}
        currentPath={currentPath}
      />
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}