import { useState } from "react";
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Chip,
  Box,
} from "@mui/material";
import { AccountTree, Check, Settings, Shield } from "@mui/icons-material";
import BranchManagementDialog from "./BranchManagementDialog";
import type { Branch } from "@/lib/types/branch";

interface BranchSelectorProps {
  branches: Branch[];
  currentBranch: string;
  repositoryId: string;
  repositoryOwnerId: string;
  onBranchChange: (branch: string) => void;
  onBranchesUpdated: () => void;
}

export default function BranchSelector({
  branches,
  currentBranch,
  repositoryId,
  repositoryOwnerId,
  onBranchChange,
  onBranchesUpdated,
}: BranchSelectorProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isManagementOpen, setIsManagementOpen] = useState(false);

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<AccountTree />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        endIcon={
          <Tooltip title="Manage Branches">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setIsManagementOpen(true);
              }}
            >
              <Settings fontSize="small" />
            </IconButton>
          </Tooltip>
        }
      >
        {currentBranch}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {branches.map((branch) => (
          <MenuItem
            key={branch.name}
            onClick={() => {
              onBranchChange(branch.name);
              setAnchorEl(null);
            }}
          >
            <ListItemText
              primary={branch.name}
              secondary={
                branch.lastCommitMessage
                  ? `Last commit: ${branch.lastCommitMessage}`
                  : null
              }
            />
            <Box sx={{ display: "flex", gap: 1, ml: 2 }}>
              {branch.isProtected && (
                <Chip
                  icon={<Shield fontSize="small" />}
                  label="Protected"
                  size="small"
                  color="primary"
                />
              )}
              {branch.name === currentBranch && (
                <ListItemIcon sx={{ minWidth: "auto" }}>
                  <Check />
                </ListItemIcon>
              )}
            </Box>
          </MenuItem>
        ))}
      </Menu>

      <BranchManagementDialog
        open={isManagementOpen}
        onClose={() => setIsManagementOpen(false)}
        branches={branches}
        currentBranch={currentBranch}
        repositoryId={repositoryId}
        repositoryOwnerId={repositoryOwnerId}
        onBranchCreated={onBranchesUpdated}
      />
    </>
  );
}
