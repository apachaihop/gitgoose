import { useState } from "react";
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
  ListItemSecondaryAction,
  Switch,
  FormControlLabel,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import { Shield } from "@mui/icons-material";
import { useCreateBranch, useSetBranchProtection } from "@/lib/hooks/useBranch";
import type { Branch } from "@/lib/types/branch";
import { useAuthStore } from "@/lib/store/useAuthStore";

interface BranchManagementDialogProps {
  open: boolean;
  onClose: () => void;
  branches: Branch[];
  currentBranch: string;
  repositoryId: string;
  repositoryOwnerId: string;
  onBranchCreated: () => void;
}

export default function BranchManagementDialog({
  open,
  onClose,
  branches,
  currentBranch,
  repositoryId,
  repositoryOwnerId,
  onBranchCreated,
}: BranchManagementDialogProps) {
  const [newBranchName, setNewBranchName] = useState("");
  const [sourceBranch, setSourceBranch] = useState(currentBranch);
  const [error, setError] = useState<string | null>(null);
  const [createBranch] = useCreateBranch();
  const [setProtection] = useSetBranchProtection();
  const { user } = useAuthStore();
  const isRepoOwner = user?.id === repositoryOwnerId;

  const handleCreateBranch = async () => {
    try {
      setError(null);
      await createBranch({
        variables: {
          input: {
            name: newBranchName,
            repositoryId,
            sourceBranch,
          },
        },
      });
      setNewBranchName("");
      onBranchCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create branch");
    }
  };

  const handleProtectionToggle = async (
    branchId: string,
    isProtected: boolean
  ) => {
    if (!isRepoOwner) {
      setError("Only repository owner can modify branch protection");
      return;
    }

    try {
      setError(null);
      await setProtection({
        variables: {
          id: branchId,
          isProtected: !isProtected,
          rules: !isProtected
            ? {
                requirePullRequest: true,
                requiredReviewers: 1,
                requireStatusChecks: true,
              }
            : undefined,
        },
      });
      onBranchCreated();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update branch protection"
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Branch Management</DialogTitle>
      <DialogContent>
        {isRepoOwner ? (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Create New Branch
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="Branch name"
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                error={!!error && error.includes("branch")}
              />
              <FormControl fullWidth size="small">
                <InputLabel>Source Branch</InputLabel>
                <Select
                  value={sourceBranch}
                  label="Source Branch"
                  onChange={(e) => setSourceBranch(e.target.value)}
                >
                  {branches.map((branch) => (
                    <MenuItem key={branch.id} value={branch.name}>
                      {branch.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                onClick={handleCreateBranch}
                disabled={!newBranchName}
                fullWidth
              >
                Create Branch
              </Button>
            </Box>
          </Box>
        ) : (
          <Alert severity="info">
            Only repository owners can create new branches
          </Alert>
        )}

        {isRepoOwner && (
          <>
            <Typography variant="subtitle1" gutterBottom>
              Branch Protection
            </Typography>
            <List>
              {branches.map((branch) => (
                <ListItem key={branch.id}>
                  <ListItemText
                    primary={branch.name}
                    secondary={
                      branch.name === currentBranch ? "Current branch" : null
                    }
                  />
                  <ListItemSecondaryAction>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={branch.isProtected}
                          onChange={() =>
                            handleProtectionToggle(
                              branch.id,
                              branch.isProtected
                            )
                          }
                          disabled={branch.name === "main"} // Prevent main branch from being unprotected
                        />
                      }
                      label={<Shield fontSize="small" />}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
