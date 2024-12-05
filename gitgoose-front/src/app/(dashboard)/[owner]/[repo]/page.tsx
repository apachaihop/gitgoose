"use client";

import { Box, Paper, Tabs, Tab } from "@mui/material";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import {
  GET_REPOSITORY_DETAILS,
  GET_CLONE_URL,
} from "@/lib/graphql/queries/repository";
import { CHECK_PERMISSION } from "@/lib/graphql/queries/auth";
import RepositoryHeader from "@/components/repository/RepositoryHeader";
import FileExplorer from "@/components/repository/FileExplorer";
import CommitHistory from "@/components/repository/CommitHistory";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import BreadcrumbNav from "@/components/navigation/BreadcrumbNav";
import IssuesList from "@/components/repository/issues/IssuesList";
import PullRequestList from "@/components/repository/pullRequests/PullRequestList";
import ErrorAlert from "@/components/shared/ErrorAlert";
import { useAuthStore } from "@/lib/store/useAuthStore";
import LanguageStats from "@/components/repository/LanguageStats";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`repo-tabpanel-${index}`}
      aria-labelledby={`repo-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `repo-tab-${index}`,
    "aria-controls": `repo-tabpanel-${index}`,
  };
}

export default function RepositoryPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState(0);
  const [currentBranch, setCurrentBranch] = useState<string>("");
  const { user } = useAuthStore();

  const { data, loading, error } = useQuery(GET_REPOSITORY_DETAILS, {
    variables: {
      owner: params.owner as string,
      name: params.repo as string,
    },
  });

  useEffect(() => {
    if (data?.repoByPath?.defaultBranch && !currentBranch) {
      setCurrentBranch(data.repoByPath.defaultBranch);
    }
  }, [data?.repoByPath?.defaultBranch, currentBranch]);

  const { data: cloneUrlData } = useQuery(GET_CLONE_URL, {
    variables: { id: data?.repoByPath.id },
    skip: !data?.repoByPath,
  });

  const { data: permissionData } = useQuery(CHECK_PERMISSION, {
    variables: {
      repoId: data?.repoByPath?.id || "",
      userId: user?.id || "",
      permission: "pull",
    },
    skip: !data?.repoByPath || !user?.id,
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert error={error} />;
  if (!data?.repoByPath) return <ErrorAlert message="Repository not found" />;

  const repository = data.repoByPath;
  const isOwner = user?.id === repository.owner.id;

  if (repository.isPrivate && !permissionData?.checkPermission) {
    return (
      <ErrorAlert message="This repository is private. You don't have permission to view it." />
    );
  }

  const openIssuesCount = repository.issues.filter(
    (issue) => !issue.closedAt
  ).length;
  const openPRsCount = repository.pullRequests.filter(
    (pr) => !pr.closedAt
  ).length;

  return (
    <Box>
      <BreadcrumbNav
        items={[
          { label: "Repositories", path: "/repositories" },
          {
            label: repository.owner.username,
            path: `/${repository.owner.username}`,
          },
          {
            label: repository.name,
            path: `/${repository.owner.username}/${repository.name}`,
            isLast: true,
          },
        ]}
      />

      <RepositoryHeader
        repository={{
          id: repository.id,
          name: repository.name,
          description: repository.description,
          isPrivate: repository.isPrivate,
          starsCount: repository.starsCount,
          watchersCount: repository.watchersCount,
          defaultBranch: repository.defaultBranch,
          cloneUrl: cloneUrlData?.getCloneUrl || "",
          owner: {
            id: repository.owner.id,
            username: repository.owner.username,
            avatarUrl: repository.owner.avatarUrl,
          },
          branches: repository.branches.map((branch) => ({
            id: branch.id,
            name: branch.name,
            isProtected: branch.isProtected,
            lastCommitSha: branch.lastCommitSha,
            lastCommitMessage: branch.lastCommitMessage,
            createdAt: branch.createdAt,
            updatedAt: branch.updatedAt,
          })),
        }}
        currentBranch={currentBranch}
        onBranchChange={setCurrentBranch}
      />

      <Paper sx={{ mt: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
        >
          <Tab label="Files" {...a11yProps(0)} />
          <Tab label="Commits" {...a11yProps(1)} />
          <Tab label={`Issues (${openIssuesCount})`} {...a11yProps(2)} />
          <Tab label={`Pull Requests (${openPRsCount})`} {...a11yProps(3)} />
        </Tabs>

        <Box sx={{ p: 2 }}>
          {activeTab === 0 && (
            <>
              <LanguageStats
                languageStatsEntities={repository.languageStatsEntities}
                showAll={true}
              />
              <Box sx={{ mt: 3 }}>
                <FileExplorer
                  repository={{
                    id: repository.id,
                    currentBranch: currentBranch,
                  }}
                  isOwner={isOwner}
                />
              </Box>
            </>
          )}
          {activeTab === 1 && (
            <CommitHistory
              repositoryId={repository.id}
              currentBranch={currentBranch}
            />
          )}
          {activeTab === 2 && <IssuesList repositoryId={repository.id} />}
          {activeTab === 3 && <PullRequestList repositoryId={repository.id} />}
        </Box>
      </Paper>
    </Box>
  );
}
