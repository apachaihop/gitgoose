import { Suspense } from 'react';
import { Button } from '@mui/material';
import IssueList from './issue-list';
import IssueFilters from './issue-filters';
import LabelManager from './label-manager';
import { Skeleton } from '@mui/material';

export default function IssuesPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Issues</h1>
        <div className="flex gap-4">
          <LabelManager repositoryId={params.id} />
          <Button 
            href={`/repositories/${params.id}/issues/new`}
            variant="contained"
          >
            New Issue
          </Button>
        </div>
      </div>

      <IssueFilters />
      
      <Suspense fallback={<IssueListSkeleton />}>
        <IssueList repositoryId={params.id} />
      </Suspense>
    </div>
  );
}

function IssueListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} height={100} />
      ))}
    </div>
  );
}