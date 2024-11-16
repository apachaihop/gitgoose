import { Suspense } from 'react';
import RepositoryDetail from './repository-detail';
import { Skeleton } from '@mui/material';

export default function RepositoryPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <Suspense fallback={<RepositoryDetailSkeleton />}>
        <RepositoryDetail id={params.id} />
      </Suspense>
    </div>
  );
}

function RepositoryDetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton height={50} />
      <Skeleton height={200} />
    </div>
  );
}