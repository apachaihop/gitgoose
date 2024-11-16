import { Suspense } from 'react';
import { Skeleton } from '@mui/material';
import IssueDetail from './issue-detail';
import IssueTimeline from './issue-timeline';

export default function IssuePage({ 
  params 
}: { 
  params: { id: string; number: string } 
}) {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <Suspense fallback={<IssueDetailSkeleton />}>
        <IssueDetail 
          repositoryId={params.id} 
          issueNumber={params.number} 
        />
      </Suspense>
      
      <div className="mt-6">
        <Suspense fallback={<TimelineSkeleton />}>
          <IssueTimeline 
            repositoryId={params.id} 
            issueNumber={params.number} 
          />
        </Suspense>
      </div>
    </div>
  );
}

function IssueDetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton height={60} />
      <Skeleton height={100} />
    </div>
  );
}

function TimelineSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} height={100} />
      ))}
    </div>
  );
}