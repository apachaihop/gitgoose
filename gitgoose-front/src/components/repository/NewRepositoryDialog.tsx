"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Box,
  Alert,
} from "@mui/material";
import { useMutation } from "@apollo/client";
import { CREATE_REPO } from "@/lib/graphql/mutations/repository";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface NewRepositoryDialogProps {
  open: boolean;
  onClose: () => void;
}

const repoSchema = z.object({
  name: z
    .string()
    .min(1, "Repository name is required")
    .regex(
      /^[a-zA-Z0-9-_]+$/,
      "Only letters, numbers, hyphens and underscores allowed"
    ),
  description: z.string().optional(),
  isPrivate: z.boolean().default(false),
});

type RepoFormInputs = z.infer<typeof repoSchema>;

export default function NewRepositoryDialog({
  open,
  onClose,
}: NewRepositoryDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RepoFormInputs>({
    resolver: zodResolver(repoSchema),
    defaultValues: {
      isPrivate: false,
    },
  });

  const [createRepo, { loading, error }] = useMutation(CREATE_REPO, {
    onCompleted: () => {
      onClose();
      reset();
    },
  });

  const onSubmit = async (data: RepoFormInputs) => {
    try {
      await createRepo({
        variables: {
          input: {
            name: data.name,
            description: data.description || "",
            isPrivate: data.isPrivate,
            defaultBranch: "main",
          },
        },
      });
    } catch (error) {
      console.error("Error creating repository:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Create a new repository</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            {error && <Alert severity="error">{error.message}</Alert>}

            <TextField
              label="Repository name"
              fullWidth
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
            />

            <TextField
              label="Description (optional)"
              fullWidth
              multiline
              rows={3}
              {...register("description")}
              error={!!errors.description}
              helperText={errors.description?.message}
            />

            <FormControlLabel
              control={<Switch {...register("isPrivate")} />}
              label="Private repository"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            Create repository
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
