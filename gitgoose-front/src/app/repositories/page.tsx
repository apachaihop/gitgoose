import { Suspense } from 'react';
import RepositoryList from './repository-list';
import CreateRepositoryButton from './create-repository-button';
import { Skeleton } from '@mui/material';

export default function RepositoriesPage() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Repositories</h1>
        <CreateRepositoryButton />
      </div>
      <Suspense fallback={<RepositoryListSkeleton />}>
        <RepositoryList />
      </Suspense>
    </div>
  );
}

function RepositoryListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} height={100} />
      ))}
    </div>
  );
}