import { Suspense } from 'react';
import { Skeleton } from '@mui/material';
import PullRequestDetail from './pull-request-detail';
import PullRequestTabs from './pull-request-tabs';

export default function PullRequestPage({ 
  params 
}: { 
  params: { id: string; prId: string } 
}) {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <Suspense fallback={<PullRequestDetailSkeleton />}>
        <PullRequestDetail 
          repositoryId={params.id} 
          pullRequestId={params.prId} 
        />
      </Suspense>
      
      <div className="mt-6">
        <PullRequestTabs 
          repositoryId={params.id} 
          pullRequestId={params.prId} 
        />
      </div>
    </div>
  );
}

function PullRequestDetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton height={60} />
      <Skeleton height={100} />
      <Skeleton height={400} />
    </div>
  );
}