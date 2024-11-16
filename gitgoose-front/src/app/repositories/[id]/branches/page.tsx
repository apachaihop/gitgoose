import { Suspense } from 'react';
import { Skeleton } from '@mui/material';
import BranchList from './branch-list';
import BranchActions from './branch-actions';

export default function BranchesPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Branches</h1>
        <BranchActions repositoryId={params.id} />
      </div>
      
      <Suspense fallback={<BranchListSkeleton />}>
        <BranchList repositoryId={params.id} />
      </Suspense>
    </div>
  );
}

function BranchListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} height={80} />
      ))}
    </div>
  );
}