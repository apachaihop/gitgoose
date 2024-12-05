import { Box, List, Typography, Alert } from "@mui/material";
import { useQuery } from "@apollo/client";
import { GET_USER_REPOSITORIES } from "@/lib/graphql/queries/repository";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorAlert from "@/components/shared/ErrorAlert";
import RepositoryListItem from "./RepositoryListItem";

interface RepositoryListProps {
  username: string;
}

export default function RepositoryList({ username }: RepositoryListProps) {
  const { data, loading, error } = useQuery(GET_USER_REPOSITORIES, {
    variables: { username },
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert error={error} />;
  if (!data?.userRepositories || data.userRepositories.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No repositories found
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ maxHeight: "calc(100vh - 400px)", overflow: "auto" }}>
      {data.userRepositories.map((repo) => (
        <RepositoryListItem key={repo.id} repository={repo} />
      ))}
    </List>
  );
}
