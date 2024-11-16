import { Suspense } from 'react';
import { Button } from '@mui/material';
import PullRequestList from './pull-request-list';
import PullRequestFilters from './pull-request-filters';
import { Skeleton } from '@mui/material';

export default function PullRequestsPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pull Requests</h1>
        <Button 
          href={`/repositories/${params.id}/pull-requests/new`}
          variant="contained"
        >
          New Pull Request
        </Button>
      </div>

      <PullRequestFilters />
      
      <Suspense fallback={<PullRequestListSkeleton />}>
        <PullRequestList repositoryId={params.id} />
      </Suspense>
    </div>
  );
}

function PullRequestListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} height={100} />
      ))}
    </div>
  );
}