'use client';

import { useState } from 'react';
import { Paper, Tabs, Tab } from '@mui/material';
import PullRequestFiles from './pull-request-files';
import PullRequestComments from './pull-request-comments';

export default function PullRequestTabs({
  repositoryId,
  pullRequestId,
}: {
  repositoryId: string;
  pullRequestId: string;
}) {
  const [currentTab, setCurrentTab] = useState(0);

  return (
    <>
      <Paper className="mb-6">
        <Tabs value={currentTab} onChange={(_, v) => setCurrentTab(v)}>
          <Tab label="Files Changed" />
          <Tab label="Comments" />
        </Tabs>
      </Paper>

      {currentTab === 0 && (
        <PullRequestFiles
          repositoryId={repositoryId}
          pullRequestId={pullRequestId}
        />
      )}
      {currentTab === 1 && (
        <PullRequestComments
          repositoryId={repositoryId}
          pullRequestId={pullRequestId}
        />
      )}
    </>
  );
}