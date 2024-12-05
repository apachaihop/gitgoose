"use client";

import {
  Box,
  Grid,
  Button,
  TextField,
  InputAdornment,
  Typography,
  Alert,
  List,
  ListItem,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import { Search, Add } from "@mui/icons-material";
import { useRepositories } from "@/lib/hooks/useRepository";
import NewRepositoryDialog from "@/components/repository/NewRepositoryDialog";
import RepositoryListItem from "@/components/repository/RepositoryListItem";
import { useState } from "react";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorAlert from "@/components/shared/ErrorAlert";
import { useAuthStore } from "@/lib/store/useAuthStore";

type FilterType = "all" | "public" | "private" | "mine";
type SortType = "updated" | "name" | "stars";

export default function RepositoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [sortType, setSortType] = useState<SortType>("updated");
  const [isNewRepoDialogOpen, setIsNewRepoDialogOpen] = useState(false);
  const { data, loading, error } = useRepositories();
  const { user } = useAuthStore();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert error={error} />;
  if (!data?.repos)
    return <Alert severity="warning">No repositories found</Alert>;

  const filteredRepos = data.repos
    .filter((repo) => {
      // Text search
      const matchesSearch = repo.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      // Filter type
      const matchesFilter =
        filterType === "all" ||
        (filterType === "public" && !repo.isPrivate) ||
        (filterType === "private" && repo.isPrivate) ||
        (filterType === "mine" && repo.owner.id === user?.id);

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortType) {
        case "name":
          return a.name.localeCompare(b.name);
        case "stars":
          return b.starsCount - a.starsCount;
        default: // "updated"
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
      }
    });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, flex: 1 }}>
          <TextField
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ width: 300 }}
          />
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Filter</InputLabel>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              label="Filter"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="public">Public</MenuItem>
              <MenuItem value="private">Private</MenuItem>
              <MenuItem value="mine">My Repositories</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Sort</InputLabel>
            <Select
              value={sortType}
              onChange={(e) => setSortType(e.target.value as SortType)}
              label="Sort"
            >
              <MenuItem value="updated">Last updated</MenuItem>
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="stars">Stars</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setIsNewRepoDialogOpen(true)}
        >
          New Repository
        </Button>
      </Box>

      {filteredRepos.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No repositories found
          </Typography>
        </Box>
      ) : (
        <List sx={{ maxHeight: "calc(100vh - 200px)", overflow: "auto" }}>
          {filteredRepos.map((repo) => (
            <RepositoryListItem key={repo.id} repository={repo} />
          ))}
        </List>
      )}

      <NewRepositoryDialog
        open={isNewRepoDialogOpen}
        onClose={() => setIsNewRepoDialogOpen(false)}
      />
    </Box>
  );
}
