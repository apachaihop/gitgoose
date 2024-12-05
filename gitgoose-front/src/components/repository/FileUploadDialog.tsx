import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from "@mui/material";
import { useMutation } from "@apollo/client";
import { gql } from "@apollo/client";

const UPLOAD_FILES = gql`
  mutation UploadFiles($input: UploadFilesInput!) {
    uploadFiles(input: $input) {
      sha
      message
    }
  }
`;

interface FileUploadDialogProps {
  open: boolean;
  onClose: () => void;
  repositoryId: string;
  branch: string;
}

export default function FileUploadDialog({
  open,
  onClose,
  repositoryId,
  branch,
}: FileUploadDialogProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [commitMessage, setCommitMessage] = useState("");

  const [uploadFiles, { loading }] = useMutation(UPLOAD_FILES);

  const handleUpload = async () => {
    try {
      const fileChanges = await Promise.all(
        files.map(async (file) => ({
          path: file.name,
          content: await file.text(),
          operation: "add",
        }))
      );

      await uploadFiles({
        variables: {
          input: {
            repositoryId,
            branch,
            commitMessage,
            files: fileChanges,
          },
        },
      });

      onClose();
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Upload Files</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <input
            type="file"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
          />
          <TextField
            label="Commit message"
            fullWidth
            multiline
            rows={2}
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={loading || !files.length || !commitMessage}
        >
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
}
