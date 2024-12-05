import { useQuery } from "@apollo/client";
import { GET_COMMITS } from "@/lib/graphql/queries/commit";
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Paper,
  Box,
} from "@mui/material";
import { format } from "date-fns";
import LoadingSpinner from "../shared/LoadingSpinner";
import ErrorAlert from "../shared/ErrorAlert";

interface CommitHistoryProps {
  repositoryId: string;
  currentBranch: string;
}

export default function CommitHistory({
  repositoryId,
  currentBranch,
}: CommitHistoryProps) {
  const { data, loading, error } = useQuery(GET_COMMITS, {
    variables: {
      repositoryId,
      branchName: currentBranch,
    },
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert error={error} />;
  if (!data?.commitsByBranch) return null;

  return (
    <Paper>
      <List>
        {data.commitsByBranch.map((commit) => (
          <ListItem key={commit.id} divider>
            <ListItemAvatar>
              <Avatar
                src={commit.author.avatarUrl}
                alt={commit.author.username}
              />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body1">{commit.message}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {format(new Date(commit.createdAt), "MMM dd, yyyy HH:mm")}
                  </Typography>
                </Box>
              }
              secondary={
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="caption">
                    {commit.author.username}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ fontFamily: "monospace" }}
                  >
                    {commit.sha.substring(0, 7)}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
