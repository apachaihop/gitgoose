'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
} from '@mui/material';
import { InsertDriveFileOutlined } from '@mui/icons-material';

const UPLOAD_FILES = gql`
  mutation UploadFiles($input: UploadFilesInput!) {
    uploadFiles(input: $input) {
      sha
      message
      authorName
    }
  }
`;

interface FileUploadDialogProps {
  open: boolean;
  onClose: () => void;
  files: File[];
  repositoryId: string;
  currentPath: string;
}

export default function FileUploadDialog({
  open,
  onClose,
  files,
  repositoryId,
  currentPath,
}: FileUploadDialogProps) {
  const [commitMessage, setCommitMessage] = useState('');
  const [uploadFiles, { loading }] = useMutation(UPLOAD_FILES);

  const handleUpload = async () => {
    try {
      await uploadFiles({
        variables: {
          input: {
            repositoryId,
            branch: 'main', // You might want to make this configurable
            commitMessage,
            files: files.map(file => ({
              path: `${currentPath}/${file.name}`.replace(/^\//, ''),
              content: file,
            })),
          },
        },
      });
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Upload Files</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Commit message"
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          margin="normal"
          required
        />
        <List>
          {files.map((file) => (
            <ListItem key={file.name}>
              <ListItemIcon>
                <InsertDriveFileOutlined />
              </ListItemIcon>
              <ListItemText
                primary={file.name}
                secondary={formatFileSize(file.size)}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={loading || !commitMessage}
        >
          {loading ? <CircularProgress size={24} /> : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}