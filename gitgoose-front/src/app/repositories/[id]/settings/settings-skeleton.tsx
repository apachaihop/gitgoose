'use client';

import { Paper, Skeleton } from '@mui/material';

export default function SettingsSkeleton() {
  return (
    <Paper className="p-4 space-y-4">
      {/* Section title skeleton */}
      <Skeleton variant="text" width={200} height={32} />
      
      {/* Content skeletons */}
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton variant="text" width={160} />
              <Skeleton variant="text" width={240} />
            </div>
            <Skeleton variant="rectangular" width={100} height={36} />
          </div>
        ))}
      </div>
    </Paper>
  );
}