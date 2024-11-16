'use client';

import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import {
  Paper,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Switch,
  FormControlLabel,
  TextField,
} from '@mui/material';
import { useState } from 'react';
import { MoreVert, Shield } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { Branch } from '@/types/branch';

const GET_BRANCHES = gql`
  query GetBranches($repositoryId: ID!) {
    branches(repositoryId: $repositoryId) {
      name
      isDefault
      protected
      lastCommit {
        sha
        message
        author {
          name
          email
        }
        date
      }
      branchProtectionRules {
        requiresApproval
        requiredApproverCount
        requiresStatusChecks
        restrictPushes
        allowForcePushes
      }
    }
  }
`;

const DELETE_BRANCH = gql`
  mutation DeleteBranch($input: DeleteBranchInput!) {
    deleteBranch(input: $input)
  }
`;

const UPDATE_BRANCH_PROTECTION = gql`
  mutation UpdateBranchProtection($input: UpdateBranchProtectionInput!) {
    updateBranchProtection(input: $input) {
      name
      protected
      branchProtectionRules {
        requiresApproval
        requiredApproverCount
        requiresStatusChecks
        restrictPushes
        allowForcePushes
      }
    }
  }
`;

export default function BranchList({ repositoryId }: { repositoryId: string }) {
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [protectionDialogOpen, setProtectionDialogOpen] = useState(false);
  const [protectionRules, setProtectionRules] = useState({
    requiresApproval: false,
    requiredApproverCount: 1,
    requiresStatusChecks: false,
    restrictPushes: false,
    allowForcePushes: false,
  });

  const { data, loading, error } = useQuery(GET_BRANCHES, {
    variables: { repositoryId },
  });

  const [deleteBranch] = useMutation(DELETE_BRANCH, {
    refetchQueries: ['GetBranches'],
  });

  const [updateBranchProtection] = useMutation(UPDATE_BRANCH_PROTECTION, {
    refetchQueries: ['GetBranches'],
  });

  if (loading) return null;
  if (error) throw error;

  const handleDeleteBranch = async (branch: Branch) => {
    if (confirm(`Are you sure you want to delete branch "${branch.name}"?`)) {
      await deleteBranch({
        variables: {
          input: {
            repositoryId,
            branchName: branch.name,
          },
        },
      });
    }
    setMenuAnchor(null);
  };

  const handleUpdateProtection = async () => {
    await updateBranchProtection({
      variables: {
        input: {
          repositoryId,
          branchName: selectedBranch?.name,
          ...protectionRules,
        },
      },
    });
    setProtectionDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      {data.branches.map((branch: Branch) => (
        <Paper key={branch.name} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Typography variant="h6">
                {branch.name}
              </Typography>
              {branch.isDefault && (
                <Typography variant="caption" className="bg-blue-100 px-2 py-1 rounded">
                  Default
                </Typography>
              )}
              {branch.protected && (
                <Shield className="text-green-500" />
              )}
            </div>

            <IconButton
              onClick={(e) => {
                setSelectedBranch(branch);
                setMenuAnchor(e.currentTarget);
              }}
            >
              <MoreVert />
            </IconButton>
          </div>

          <div className="mt-2">
            <Typography variant="body2" color="text.secondary">
              Last commit {formatDistanceToNow(new Date(branch.lastCommit.date))} ago by{' '}
              {branch.lastCommit.author.name}
            </Typography>
            <Typography variant="body2" className="mt-1">
              {branch.lastCommit.message}
            </Typography>
          </div>
        </Paper>
      ))}

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => {
          setProtectionDialogOpen(true);
          setMenuAnchor(null);
          setProtectionRules(selectedBranch?.branchProtectionRules || {
            requiresApproval: false,
            requiredApproverCount: 1,
            requiresStatusChecks: false,
            restrictPushes: false,
            allowForcePushes: false,
          });
        }}>
          Protection Rules
        </MenuItem>
        {selectedBranch && !selectedBranch.isDefault && (
          <MenuItem onClick={() => handleDeleteBranch(selectedBranch)}>
            Delete Branch
          </MenuItem>
        )}
      </Menu>

      <Dialog
        open={protectionDialogOpen}
        onClose={() => setProtectionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Branch Protection Rules</DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-4">
            <FormControlLabel
              control={
                <Switch
                  checked={protectionRules.requiresApproval}
                  onChange={(e) => setProtectionRules({
                    ...protectionRules,
                    requiresApproval: e.target.checked,
                  })}
                />
              }
              label="Require pull request reviews"
            />

            {protectionRules.requiresApproval && (
              <TextField
                type="number"
                label="Required number of approvals"
                value={protectionRules.requiredApproverCount}
                onChange={(e) => setProtectionRules({
                  ...protectionRules,
                  requiredApproverCount: parseInt(e.target.value),
                })}
                inputProps={{ min: 1 }}
              />
            )}

            <FormControlLabel
              control={
                <Switch
                  checked={protectionRules.requiresStatusChecks}
                  onChange={(e) => setProtectionRules({
                    ...protectionRules,
                    requiresStatusChecks: e.target.checked,
                  })}
                />
              }
              label="Require status checks to pass"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={protectionRules.restrictPushes}
                  onChange={(e) => setProtectionRules({
                    ...protectionRules,
                    restrictPushes: e.target.checked,
                  })}
                />
              }
              label="Restrict who can push"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={protectionRules.allowForcePushes}
                  onChange={(e) => setProtectionRules({
                    ...protectionRules,
                    allowForcePushes: e.target.checked,
                  })}
                />
              }
              label="Allow force pushes"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProtectionDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdateProtection}
          >
            Save Rules
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}