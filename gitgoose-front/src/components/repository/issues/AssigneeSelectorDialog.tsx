import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  DialogActions,
  Divider,
  Typography,
} from "@mui/material";
import { Person } from "@mui/icons-material";
import { useQuery } from "@apollo/client";
import { GET_REPOSITORY_COLLABORATORS } from "@/lib/graphql/queries/repository";
import { useAuthStore } from "@/lib/store/useAuthStore";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorAlert from "@/components/shared/ErrorAlert";

interface AssigneeSelectorDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectAssignee: (assigneeId: string) => void;
  repositoryId: string;
  currentAssignees?: { id: string; username: string }[];
}

export default function AssigneeSelectorDialog({
  open,
  onClose,
  onSelectAssignee,
  repositoryId,
  currentAssignees = [],
}: AssigneeSelectorDialogProps) {
  const { user } = useAuthStore();
  const { data, loading, error } = useQuery(GET_REPOSITORY_COLLABORATORS, {
    variables: { repositoryId },
    skip: !open,
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert error={error} />;

  const isAssigned = (userId: string) =>
    currentAssignees.some((assignee) => assignee.id === userId);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Select Assignee</DialogTitle>
      <DialogContent>
        <List>
          {user && (
            <>
              <ListItem
                button
                onClick={() => {
                  onSelectAssignee(user.id);
                  onClose();
                }}
                selected={isAssigned(user.id)}
              >
                <ListItemAvatar>
                  <Avatar src={user.avatarUrl}>
                    <Person />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={user.username} secondary="You" />
              </ListItem>
              <Divider />
              <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
                Collaborators
              </Typography>
            </>
          )}

          {data?.repositoryCollaborators
            .filter((collab) => collab.id !== user?.id)
            .map((collaborator) => (
              <ListItem
                key={collaborator.id}
                button
                onClick={() => {
                  onSelectAssignee(collaborator.id);
                  onClose();
                }}
                selected={isAssigned(collaborator.id)}
              >
                <ListItemAvatar>
                  <Avatar
                    src={collaborator.avatarUrl}
                    alt={collaborator.username}
                  >
                    <Person />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={collaborator.username} />
              </ListItem>
            ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}
