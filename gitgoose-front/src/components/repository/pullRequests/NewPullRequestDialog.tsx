import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
} from "@mui/material";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_PULL_REQUEST } from "@/lib/graphql/mutations/pullRequest";
import { GET_BRANCHES } from "@/lib/graphql/queries/branch";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ErrorAlert from "@/components/shared/ErrorAlert";

interface NewPullRequestDialogProps {
  open: boolean;
  onClose: () => void;
  repositoryId: string;
  onPRCreated: () => void;
}

const prSchema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Description is required"),
  sourceBranch: z.string().min(1, "Source branch is required"),
  targetBranch: z.string().min(1, "Target branch is required"),
});

type PRFormInputs = z.infer<typeof prSchema>;

export default function NewPullRequestDialog({
  open,
  onClose,
  repositoryId,
  onPRCreated,
}: NewPullRequestDialogProps) {
  const [error, setError] = useState<string | null>(null);

  const { data: branchesData } = useQuery(GET_BRANCHES, {
    variables: { repositoryId },
  });

  const [createPR, { loading }] = useMutation(CREATE_PULL_REQUEST);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PRFormInputs>({
    resolver: zodResolver(prSchema),
  });

  const handleClose = () => {
    reset();
    setError(null);
    onClose();
  };

  const onSubmit = async (data: PRFormInputs) => {
    try {
      await createPR({
        variables: {
          input: {
            ...data,
            repositoryId,
            isDraft: false,
          },
        },
      });
      onPRCreated();
      handleClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create pull request"
      );
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Create Pull Request</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {error && <ErrorAlert message={error} />}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Controller
              name="title"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Title"
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  fullWidth
                />
              )}
            />

            <Controller
              name="body"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description"
                  multiline
                  rows={4}
                  error={!!errors.body}
                  helperText={errors.body?.message}
                  fullWidth
                />
              )}
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              <Controller
                name="sourceBranch"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.sourceBranch}>
                    <InputLabel>Source Branch</InputLabel>
                    <Select {...field} label="Source Branch">
                      {branchesData?.branchesByRepository.map((branch: any) => (
                        <MenuItem key={branch.name} value={branch.name}>
                          {branch.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.sourceBranch && (
                      <Typography color="error" variant="caption">
                        {errors.sourceBranch.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />

              <Controller
                name="targetBranch"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.targetBranch}>
                    <InputLabel>Target Branch</InputLabel>
                    <Select {...field} label="Target Branch">
                      {branchesData?.branchesByRepository.map((branch: any) => (
                        <MenuItem key={branch.name} value={branch.name}>
                          {branch.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.targetBranch && (
                      <Typography color="error" variant="caption">
                        {errors.targetBranch.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            Create Pull Request
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
