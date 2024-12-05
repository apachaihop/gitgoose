"use client";

import {
  Box,
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  ListItemAvatar,
  Avatar,
  IconButton,
  Tooltip,
  Chip,
} from "@mui/material";
import { useQuery } from "@apollo/client";
import { GET_USER_ACTIVITY } from "@/lib/graphql/queries/activity";
import { useAuthStore } from "@/lib/store/useAuthStore";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorAlert from "@/components/shared/ErrorAlert";
import { useState } from "react";
import NewRepositoryDialog from "@/components/repository/NewRepositoryDialog";
import { formatDistanceToNow } from "date-fns";
import {
  Add,
  GitHub,
  Merge,
  BugReport,
  Label,
  Person,
} from "@mui/icons-material";
import Link from "next/link";
import { GET_TRENDING_REPOS } from "@/lib/graphql/queries/repository";
import TrendingRepositoryCard from "@/components/repository/TrendingRepositoryCard";

const getActivityIcon = (type: string) => {
  switch (type) {
    case "REPO_CREATE":
    case "REPO_DELETE":
    case "REPO_UPDATE":
      return <GitHub />;
    case "PR_CREATE":
    case "PR_MERGE":
    case "PR_CLOSE":
      return <Merge />;
    case "ISSUE_CREATE":
    case "ISSUE_CLOSE":
    case "ISSUE_REOPEN":
      return <BugReport />;
    case "ISSUE_ASSIGN":
    case "ISSUE_UNASSIGN":
      return <Person />;
    case "ISSUE_LABEL_ADD":
    case "ISSUE_LABEL_REMOVE":
      return <Label />;
    default:
      return <GitHub />;
  }
};

const getActivityColor = (type: string) => {
  if (type.startsWith("REPO_")) return "primary";
  if (type.startsWith("PR_")) return "secondary";
  if (type.startsWith("ISSUE_")) return "error";
  return "default";
};

export default function HomePage() {
  const { user } = useAuthStore();
  const [isNewRepoDialogOpen, setIsNewRepoDialogOpen] = useState(false);
  const { data, loading, error } = useQuery(GET_USER_ACTIVITY, {
    variables: {
      input: {
        days: 7,
        limit: 10,
      },
    },
  });

  const {
    data: trendingData,
    loading: trendingLoading,
    error: trendingError,
  } = useQuery(GET_TRENDING_REPOS);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert error={error} />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Welcome back, {user?.name || user?.username}!
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Quick Actions
            </Typography>
            <List>
              <ListItem>
                <Button
                  onClick={() => setIsNewRepoDialogOpen(true)}
                  variant="contained"
                  fullWidth
                  startIcon={<Add />}
                >
                  New Repository
                </Button>
              </ListItem>
              <ListItem>
                <Button
                  component={Link}
                  href="/repositories"
                  variant="outlined"
                  fullWidth
                  startIcon={<GitHub />}
                >
                  My Repositories
                </Button>
              </ListItem>
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Recent Activity</Typography>
              <Tooltip title="View all activity">
                <IconButton component={Link} href="/activity">
                  <Add />
                </IconButton>
              </Tooltip>
            </Box>
            <List>
              {data?.activities.map((activity) => (
                <ListItem
                  key={activity.id}
                  divider
                  sx={{
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      src={activity.repository.owner.avatarUrl}
                      alt={activity.repository.owner.username}
                    >
                      {getActivityIcon(activity.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {activity.description}
                        <Chip
                          label={activity.type.replace(/_/g, " ")}
                          size="small"
                          color={getActivityColor(activity.type)}
                        />
                      </Box>
                    }
                    secondary={
                      <Box
                        component="span"
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Link
                          href={activity.repository.path}
                          style={{ textDecoration: "none", color: "inherit" }}
                        >
                          {activity.repository.owner.username}/
                          {activity.repository.name}
                        </Link>
                        • {formatDistanceToNow(new Date(activity.timestamp))}{" "}
                        ago
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Trending Repositories
            </Typography>
            {trendingLoading ? (
              <LoadingSpinner />
            ) : trendingError ? (
              <ErrorAlert error={trendingError} />
            ) : (
              <Grid container spacing={2}>
                {trendingData?.trendingRepos?.map((repo: any) => (
                  <Grid item xs={12} md={4} key={repo.id}>
                    <TrendingRepositoryCard repository={repo} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>

      <NewRepositoryDialog
        open={isNewRepoDialogOpen}
        onClose={() => setIsNewRepoDialogOpen(false)}
      />
    </Box>
  );
}
