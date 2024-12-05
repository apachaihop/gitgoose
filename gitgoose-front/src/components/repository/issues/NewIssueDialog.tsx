"use client";

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
import { CREATE_ISSUE } from "@/lib/graphql/mutations/issue";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ErrorAlert from "@/components/shared/ErrorAlert";

interface NewIssueDialogProps {
  open: boolean;
  onClose: () => void;
  repositoryId: string;
  onIssueCreated: () => void;
}

const issueSchema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Description is required"),
});

type IssueFormInputs = z.infer<typeof issueSchema>;

export default function NewIssueDialog({
  open,
  onClose,
  repositoryId,
  onIssueCreated,
}: NewIssueDialogProps) {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IssueFormInputs>({
    resolver: zodResolver(issueSchema),
  });

  const [createIssue, { loading }] = useMutation(CREATE_ISSUE, {
    onCompleted: () => {
      onIssueCreated();
      handleClose();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleClose = () => {
    reset();
    setError(null);
    onClose();
  };

  const onSubmit = async (data: IssueFormInputs) => {
    try {
      await createIssue({
        variables: {
          input: {
            ...data,
            repositoryId,
          },
        },
      });
    } catch (err) {
      console.error("Error creating issue:", err);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Create new issue</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            {error && <ErrorAlert message={error} />}

            <TextField
              label="Title"
              fullWidth
              {...register("title")}
              error={!!errors.title}
              helperText={errors.title?.message}
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={4}
              {...register("body")}
              error={!!errors.body}
              helperText={errors.body?.message}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            Create issue
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
