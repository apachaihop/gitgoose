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
  Avatar,
  Typography,
} from "@mui/material";
import {
  Search,
  Add,
  MoreVert,
  Label,
  Person,
  RemoveCircle,
} from "@mui/icons-material";
import {
  useIssuesByRepository,
  useChangeIssueState,
  useAddLabel,
  useAssignIssue,
  useRemoveLabel,
  useUnassignIssue,
} from "@/lib/hooks/useIssue";
import NewIssueDialog from "./NewIssueDialog";
import { formatDistanceToNow } from "date-fns";
import { useAuthStore } from "@/lib/store/useAuthStore";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorAlert from "@/components/shared/ErrorAlert";
import LabelSelectorDialog from "./LabelSelectorDialog";
import AssigneeSelectorDialog from "./AssigneeSelectorDialog";
import { useQuery } from "@apollo/client";
import { GET_ISSUES_BY_REPOSITORY } from "@/lib/graphql/queries/issue";

interface IssuesListProps {
  repositoryId: string;
}

export default function IssuesList({ repositoryId }: IssuesListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [isNewIssueDialogOpen, setIsNewIssueDialogOpen] = useState(false);
  const [isLabelDialogOpen, setIsLabelDialogOpen] = useState(false);
  const [isAssigneeDialogOpen, setIsAssigneeDialogOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user } = useAuthStore();

  const { data, loading, error, refetch } = useQuery(GET_ISSUES_BY_REPOSITORY, {
    variables: { repositoryId },
  });

  const [changeIssueState] = useChangeIssueState();
  const [addLabel] = useAddLabel();
  const [assignIssue] = useAssignIssue();
  const [removeLabel] = useRemoveLabel();
  const [unassignIssue] = useUnassignIssue();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert error={error} />;

  const filteredIssues =
    data?.issuesByRepository.filter((issue) => {
      const matchesSearch = issue.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesLabels =
        selectedLabels.length === 0 ||
        selectedLabels.every((label) => issue.labels.includes(label));
      return matchesSearch && matchesLabels;
    }) || [];

  const handleIssueAction = async (action: string) => {
    if (!selectedIssue || !user) return;

    // Check if user has permission to manage this issue
    const issue = data?.issuesByRepository.find((i) => i.id === selectedIssue);
    const canManageIssue = user.id === issue?.author.id;

    if (!canManageIssue) {
      setError("You don't have permission to manage this issue");
      setAnchorEl(null);
      return;
    }

    try {
      switch (action) {
        case "close":
          await changeIssueState({
            variables: {
              issueId: selectedIssue,
              state: "closed",
            },
          });
          break;
        case "reopen":
          await changeIssueState({
            variables: {
              issueId: selectedIssue,
              state: "open",
            },
          });
          break;
        case "addLabel":
          setIsLabelDialogOpen(true);
          break;
        case "assign":
          setIsAssigneeDialogOpen(true);
          break;
      }
      await refetch();
    } catch (error) {
      console.error("Error handling issue action:", error);
    }
    setAnchorEl(null);
  };

  const handleLabelSelect = async (label: string) => {
    if (!selectedIssue) return;
    try {
      await addLabel({
        variables: {
          id: selectedIssue,
          label,
        },
      });
      await refetch();
    } catch (error) {
      console.error("Error adding label:", error);
    }
  };

  const handleAssigneeSelect = async (assigneeId: string) => {
    if (!selectedIssue) return;
    try {
      await assignIssue({
        variables: {
          issueId: selectedIssue,
          assigneeId,
        },
      });
      await refetch();
    } catch (error) {
      console.error("Error assigning user:", error);
    }
  };

  const handleLabelClick = (label: string) => {
    setSelectedLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const handleRemoveLabel = async (issueId: string, labelToRemove: string) => {
    try {
      await removeLabel({
        variables: {
          id: issueId,
          label: labelToRemove,
        },
      });
      await refetch();
    } catch (error) {
      console.error("Error removing label:", error);
    }
  };

  const handleRemoveAssignee = async (issueId: string, assigneeId: string) => {
    try {
      await unassignIssue({
        variables: {
          issueId,
          assigneeId,
        },
      });
      await refetch();
    } catch (error) {
      console.error("Error removing assignee:", error);
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <TextField
            placeholder="Search issues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <Box>
            {selectedLabels.map((label) => (
              <Chip
                key={label}
                label={label}
                onDelete={() =>
                  setSelectedLabels(selectedLabels.filter((l) => l !== label))
                }
                sx={{ mr: 1 }}
              />
            ))}
            <Button
              startIcon={<Label />}
              onClick={() => setIsLabelDialogOpen(true)}
            >
              Filter by label
            </Button>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setIsNewIssueDialogOpen(true)}
        >
          New Issue
        </Button>
      </Box>

      <List>
        {filteredIssues.map((issue) => (
          <ListItem
            key={issue.id}
            divider
            sx={{
              flexDirection: "column",
              alignItems: "flex-start",
              py: 2,
            }}
          >
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="subtitle1">{issue.title}</Typography>
                    <Chip
                      size="small"
                      label={issue.state}
                      color={issue.state === "open" ? "success" : "default"}
                    />
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 1 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      {issue.body}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      <Typography variant="caption">
                        #{issue.id} opened{" "}
                        {formatDistanceToNow(new Date(issue.createdAt))} ago by{" "}
                        {issue.author.username}
                      </Typography>
                      {issue.labels?.map((label) => (
                        <Chip
                          key={label}
                          size="small"
                          label={label}
                          icon={<Label />}
                          variant="outlined"
                          onClick={() => handleLabelClick(label)}
                          onDelete={() => handleRemoveLabel(issue.id, label)}
                          sx={{ cursor: "pointer" }}
                        />
                      ))}
                      {issue.assignees?.map((assignee) => (
                        <Chip
                          key={assignee.username}
                          size="small"
                          icon={<Person />}
                          avatar={
                            <Avatar
                              src={assignee.avatarUrl}
                              alt={assignee.username}
                            />
                          }
                          label={assignee.username}
                          variant="outlined"
                          onDelete={() =>
                            handleRemoveAssignee(issue.id, assignee.id)
                          }
                        />
                      ))}
                    </Box>
                  </Box>
                }
              />
              <IconButton
                onClick={(e) => {
                  setSelectedIssue(issue.id);
                  setAnchorEl(e.currentTarget);
                }}
              >
                <MoreVert />
              </IconButton>
            </Box>
          </ListItem>
        ))}
      </List>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          onClick={() =>
            handleIssueAction(
              data?.issuesByRepository.find((i) => i.id === selectedIssue)
                ?.state === "open"
                ? "close"
                : "reopen"
            )
          }
        >
          {data?.issuesByRepository.find((i) => i.id === selectedIssue)
            ?.state === "open"
            ? "Close Issue"
            : "Reopen Issue"}
        </MenuItem>
        <MenuItem onClick={() => handleIssueAction("addLabel")}>
          Add labels
        </MenuItem>
        <MenuItem onClick={() => handleIssueAction("assign")}>Assign</MenuItem>
      </Menu>

      <NewIssueDialog
        open={isNewIssueDialogOpen}
        onClose={() => setIsNewIssueDialogOpen(false)}
        repositoryId={repositoryId}
        onIssueCreated={() => refetch()}
      />

      <LabelSelectorDialog
        open={isLabelDialogOpen}
        onClose={() => setIsLabelDialogOpen(false)}
        onSelectLabel={handleLabelSelect}
        currentLabels={
          data?.issuesByRepository.find((i) => i.id === selectedIssue)
            ?.labels || []
        }
      />

      <AssigneeSelectorDialog
        open={isAssigneeDialogOpen}
        onClose={() => setIsAssigneeDialogOpen(false)}
        onSelectAssignee={handleAssigneeSelect}
        repositoryId={repositoryId}
      />
    </Box>
  );
}
