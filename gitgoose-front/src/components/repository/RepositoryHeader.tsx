import { useState } from "react";
import { useMutation } from "@apollo/client";
import {
  STAR_REPOSITORY,
  UNSTAR_REPOSITORY,
  WATCH_REPOSITORY,
  UNWATCH_REPOSITORY,
} from "@/lib/graphql/mutations/social";
import {
  Box,
  Button,
  Typography,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Star, Visibility, Share } from "@mui/icons-material";
import BranchSelector from "./BranchSelector";
import { CloneButton } from "./CloneButton";
import { useQuery } from "@apollo/client";
import { GET_BRANCHES } from "@/lib/graphql/queries/branch";
import LoadingSpinner from "../shared/LoadingSpinner";

interface RepositoryHeaderProps {
  repository: {
    id: string;
    name: string;
    description?: string;
    isPrivate: boolean;
    starsCount: number;
    watchersCount: number;
    defaultBranch: string;
    cloneUrl?: string;
    owner: {
      id: string;
      username: string;
      avatarUrl?: string;
    };
    isStarredByViewer: boolean;
    isWatchedByViewer: boolean;
  };
  currentBranch: string;
  onBranchChange: (branch: string) => void;
}

export default function RepositoryHeader({
  repository,
  currentBranch,
  onBranchChange,
}: RepositoryHeaderProps) {
  const [isStarred, setIsStarred] = useState(repository.isStarredByViewer);
  const [isWatched, setIsWatched] = useState(repository.isWatchedByViewer);
  const [starsCount, setStarsCount] = useState(repository.starsCount);
  const [watchersCount, setWatchersCount] = useState(repository.watchersCount);

  const [starRepository] = useMutation(STAR_REPOSITORY);
  const [unstarRepository] = useMutation(UNSTAR_REPOSITORY);
  const [watchRepository] = useMutation(WATCH_REPOSITORY);
  const [unwatchRepository] = useMutation(UNWATCH_REPOSITORY);

  const { data: branchesData, refetch } = useQuery(GET_BRANCHES, {
    variables: { repositoryId: repository?.id },
    skip: !repository?.id,
  });

  if (!repository) return null;

  const visibility = repository.isPrivate ? "private" : "public";

  const handleStar = async () => {
    try {
      if (isStarred) {
        await unstarRepository({ variables: { repositoryId: repository.id } });
        setStarsCount((prev) => prev - 1);
      } else {
        await starRepository({ variables: { repositoryId: repository.id } });
        setStarsCount((prev) => prev + 1);
      }
      setIsStarred(!isStarred);
    } catch (error) {
      console.error("Error toggling star:", error);
    }
  };

  const handleWatch = async () => {
    try {
      if (isWatched) {
        await unwatchRepository({ variables: { repositoryId: repository.id } });
        setWatchersCount((prev) => prev - 1);
      } else {
        await watchRepository({ variables: { repositoryId: repository.id } });
        setWatchersCount((prev) => prev + 1);
      }
      setIsWatched(!isWatched);
    } catch (error) {
      console.error("Error toggling watch:", error);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Typography variant="h4" component="h1">
              {repository.name}
              <Chip label={visibility} size="small" sx={{ ml: 1 }} />
            </Typography>
          </Box>
          {repository.description && (
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              {repository.description}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Visibility color={isWatched ? "primary" : "inherit"} />}
            size="small"
            onClick={handleWatch}
          >
            {isWatched ? "Unwatch" : "Watch"}
            <Chip label={watchersCount || 0} size="small" sx={{ ml: 1 }} />
          </Button>

          <Button
            variant="outlined"
            startIcon={<Star color={isStarred ? "primary" : "inherit"} />}
            size="small"
            onClick={handleStar}
          >
            {isStarred ? "Unstar" : "Star"}
            <Chip label={starsCount || 0} size="small" sx={{ ml: 1 }} />
          </Button>

          <Tooltip title="Share repository">
            <IconButton>
              <Share />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
        {branchesData?.branchesByRepository && repository.owner && (
          <BranchSelector
            branches={branchesData.branchesByRepository}
            currentBranch={currentBranch}
            repositoryId={repository.id}
            repositoryOwnerId={repository.owner.id}
            onBranchChange={onBranchChange}
            onBranchesUpdated={() => refetch()}
          />
        )}
        {repository.cloneUrl && <CloneButton cloneUrl={repository.cloneUrl} />}
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      ></Box>
    </Box>
  );
}
