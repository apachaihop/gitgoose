import { Suspense } from 'react';
import { Grid, Paper, Skeleton } from '@mui/material';
import AdminStats from './admin-stats';
import SystemStatus from './system-status';
import RecentActivity from './recent-activity';
import AdminNav from './admin-nav';

export default function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex gap-6">
        <AdminNav />
        
        <div className="flex-1 space-y-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>

          <Suspense fallback={<StatsSkeleton />}>
            <AdminStats />
          </Suspense>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Suspense fallback={<ComponentSkeleton />}>
                <SystemStatus />
              </Suspense>
            </Grid>
            <Grid item xs={12} md={6}>
              <Suspense fallback={<ComponentSkeleton />}>
                <RecentActivity />
              </Suspense>
            </Grid>
          </Grid>
        </div>
      </div>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <Grid container spacing={3}>
      {[...Array(6)].map((_, i) => (
        <Grid item xs={12} sm={6} md={4} key={i}>
          <Skeleton height={120} />
        </Grid>
      ))}
    </Grid>
  );
}

function ComponentSkeleton() {
  return <Skeleton height={400} />;
}