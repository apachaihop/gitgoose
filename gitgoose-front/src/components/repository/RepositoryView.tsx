import { Box, Tabs, Tab, Typography, Button } from "@mui/material";
import { useState } from "react";
import { useRepository } from "@/lib/hooks/useRepository";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorAlert from "@/components/shared/ErrorAlert";
import { useQuery } from "@apollo/client";
import { GET_CLONE_URL } from "@/lib/graphql/queries/repository";
import LanguageStats from "@/components/repository/LanguageStats";

export default function RepositoryView({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  const [activeTab, setActiveTab] = useState(0);
  const { data: repoData, loading, error } = useRepository(repo);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert error={error} />;
  if (!repoData?.repo) return <Typography>Repository not found</Typography>;

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h4">
          {owner}/{repoData.repo.name}
        </Typography>
        <Button variant="contained" color="primary">
          Clone
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography color="text.secondary">
          {repoData.repo.description}
        </Typography>
        <Box sx={{ mt: 1, display: "flex", gap: 2 }}>
          <Typography variant="body2">⭐ {repoData.repo.starsCount}</Typography>
          <Typography variant="body2">🔄 {repoData.repo.forksCount}</Typography>
          <Typography variant="body2">
            {repoData.repo.isPrivate ? "🔒 Private" : "🌍 Public"}
          </Typography>
        </Box>
        <LanguageStats
          languageStatsEntities={repoData.repo.languageStatsEntities}
          showAll={false}
        />
      </Box>

      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
        <Tab label="Code" />
        <Tab label="Issues" />
        <Tab label="Pull Requests" />
        <Tab label="Settings" />
      </Tabs>

      {/* Tab panels */}
    </Box>
  );
}
