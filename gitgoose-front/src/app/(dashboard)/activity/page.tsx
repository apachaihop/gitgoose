"use client";

import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  SelectChangeEvent,
} from "@mui/material";
import { useQuery } from "@apollo/client";
import { GET_USER_ACTIVITY } from "@/lib/graphql/queries/activity";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorAlert from "@/components/shared/ErrorAlert";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { GitHub, Merge, BugReport, Label, Person } from "@mui/icons-material";
import Link from "next/link";

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

const timeRanges = [
  { value: 7, label: "Last 7 days" },
  { value: 30, label: "Last 30 days" },
  { value: 90, label: "Last 3 months" },
];

const limitOptions = [
  { value: 20, label: "20 items" },
  { value: 50, label: "50 items" },
  { value: 100, label: "100 items" },
];

export default function ActivityPage() {
  const [timeRange, setTimeRange] = useState<number>(30);
  const [limit, setLimit] = useState<number>(50);

  const { data, loading, error } = useQuery(GET_USER_ACTIVITY, {
    variables: {
      input: {
        days: timeRange,
        limit: limit,
      },
    },
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert error={error} />;

  const handleTimeRangeChange = (event: SelectChangeEvent<number>) => {
    setTimeRange(event.target.value as number);
  };

  const handleLimitChange = (event: SelectChangeEvent<number>) => {
    setLimit(event.target.value as number);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Activity History
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                label="Time Range"
                onChange={handleTimeRangeChange}
              >
                {timeRanges.map((range) => (
                  <MenuItem key={range.value} value={range.value}>
                    {range.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Show</InputLabel>
              <Select value={limit} label="Show" onChange={handleLimitChange}>
                {limitOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

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
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                    • {formatDistanceToNow(new Date(activity.timestamp))} ago
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}
