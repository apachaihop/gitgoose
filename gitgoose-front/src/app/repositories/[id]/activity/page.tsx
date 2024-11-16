import { Suspense } from 'react';
import { Paper, Skeleton } from '@mui/material';
import ActivityTimeline from './activity-timeline';
import ActivityFilters from './activity-filters';

export default function ActivityPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Activity Timeline</h1>
      
      <ActivityFilters />
      
      <Suspense fallback={<ActivitySkeleton />}>
        <ActivityTimeline repositoryId={params.id} />
      </Suspense>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <Paper className="p-4">
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton variant="circular" width={40} height={40} />
            <div className="flex-1">
              <Skeleton height={24} width="60%" />
              <Skeleton height={20} width="40%" />
            </div>
          </div>
        ))}
      </div>
    </Paper>
  );
}