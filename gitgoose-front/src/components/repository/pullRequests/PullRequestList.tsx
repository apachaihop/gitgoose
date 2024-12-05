import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Avatar,
} from "@mui/material";
import {
  Search,
  Add,
  MoreVert,
  Merge,
  CheckCircle,
  ErrorOutline,
  Schedule,
} from "@mui/icons-material";
import { useQuery, useMutation } from "@apollo/client";
import { formatDistanceToNow } from "date-fns";
import { GET_PULL_REQUESTS_BY_REPOSITORY } from "@/lib/graphql/queries/pullRequest";
import { MERGE_PULL_REQUEST } from "@/lib/graphql/mutations/pullRequest";
import NewPullRequestDialog from "./NewPullRequestDialog";
import ErrorAlert from "@/components/shared/ErrorAlert";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useIsRepoAdmin } from "@/lib/hooks/usePermissions";

interface PullRequest {
  id: string;
  title: string;
  number: number;
  state: string;
  isMerged: boolean;
  createdAt: string;
  author: {
    id: string;
    username: string;
  };
  reviewers: {
    id: string;
    username: string;
    avatarUrl: string;
  }[];
}

interface PullRequestListProps {
  repositoryId: string;
}

export default function PullRequestList({
  repositoryId,
}: PullRequestListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewPRDialogOpen, setIsNewPRDialogOpen] = useState(false);
  const [selectedPR, setSelectedPR] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const { data: adminData } = useIsRepoAdmin(repositoryId, user?.id || "");

  const {
    data,
    loading,
    error: queryError,
    refetch,
  } = useQuery(GET_PULL_REQUESTS_BY_REPOSITORY, {
    variables: { repositoryId },
  });

  const [mergePR] = useMutation(MERGE_PULL_REQUEST);

  if (loading) return <LoadingSpinner />;
  if (queryError) return <ErrorAlert error={queryError} />;

  const currentPR = data?.pullRequestsByRepository.find(
    (p: PullRequest) => p.id === selectedPR
  );
  const canManagePR =
    user?.id === currentPR?.author.id || adminData?.checkPermission;

  const handlePRAction = async (action: string) => {
    if (!selectedPR || !user) return;

    if (!canManagePR) {
      setError("You don't have permission to manage this pull request");
      setAnchorEl(null);
      return;
    }

    try {
      switch (action) {
        case "merge":
          await mergePR({
            variables: { id: selectedPR },
          });
          break;
      }
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error handling PR action");
    }
    setAnchorEl(null);
  };

  const filteredPRs = data?.pullRequestsByRepository.filter((pr: PullRequest) =>
    pr.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box>
      {error && <ErrorAlert message={error} />}

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <TextField
          placeholder="Search pull requests..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ width: "300px" }}
        />
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setIsNewPRDialogOpen(true)}
        >
          New Pull Request
        </Button>
      </Box>

      <List>
        {filteredPRs?.map((pr: any) => (
          <ListItem
            key={pr.id}
            sx={{
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
              mb: 1,
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
            secondaryAction={
              <IconButton
                onClick={(e) => {
                  setSelectedPR(pr.id);
                  setAnchorEl(e.currentTarget);
                }}
              >
                <MoreVert />
              </IconButton>
            }
          >
            <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
              {getStatusIcon(pr.state, pr.isMerged)}
            </Box>
            <ListItemText
              primary={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="subtitle1">{pr.title}</Typography>
                  <Chip
                    size="small"
                    label={`#${pr.number}`}
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              }
              secondary={
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    alignItems: "center",
                    mt: 0.5,
                  }}
                >
                  <Typography variant="caption">
                    {pr.author.username} opened{" "}
                    {formatDistanceToNow(new Date(pr.createdAt))} ago
                  </Typography>
                  {pr.reviewers?.map((reviewer: any) => (
                    <Avatar
                      key={reviewer.id}
                      alt={reviewer.username}
                      src={reviewer.avatarUrl}
                      sx={{ width: 24, height: 24 }}
                    />
                  ))}
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {canManagePR && (
          <MenuItem onClick={() => handlePRAction("merge")}>
            Merge Pull Request
          </MenuItem>
        )}
        <MenuItem onClick={() => handlePRAction("addReviewer")}>
          Add Me as Reviewer
        </MenuItem>
        <MenuItem onClick={() => handlePRAction("removeReviewer")}>
          Remove Me as Reviewer
        </MenuItem>
      </Menu>

      <NewPullRequestDialog
        open={isNewPRDialogOpen}
        onClose={() => setIsNewPRDialogOpen(false)}
        repositoryId={repositoryId}
        onPRCreated={() => refetch()}
      />
    </Box>
  );
}
