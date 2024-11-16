'use client';

import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import {
  Grid,
  Paper,
  Typography,
  LinearProgress,
} from '@mui/material';
import {
  People,
  Storage,
  CloudUpload,
  Speed,
  BugReport,
  MergeType,
} from '@mui/icons-material';
import { formatBytes } from '@/utils/format';

const GET_ADMIN_STATS = gql`
  query GetAdminStats {
    adminStats {
      totalUsers
      activeUsers
      totalRepositories
      storageUsed
      bandwidthUsed
      totalIssues
      totalPullRequests
    }
  }
`;

export default function AdminStats() {
  const { data, loading, error } = useQuery(GET_ADMIN_STATS);

  if (loading || error) return null;

  const stats = data.adminStats;

  const STAT_CARDS = [
    {
      icon: People,
      label: 'Total Users',
      value: stats.totalUsers,
      subtext: `${stats.activeUsers} active`,
      color: 'primary',
    },
    {
      icon: Storage,
      label: 'Repositories',
      value: stats.totalRepositories,
      subtext: 'Total repositories',
      color: 'secondary',
    },
    {
      icon: CloudUpload,
      label: 'Storage Used',
      value: formatBytes(stats.storageUsed),
      subtext: 'Total storage',
      color: 'success',
    },
    {
      icon: Speed,
      label: 'Bandwidth',
      value: formatBytes(stats.bandwidthUsed),
      subtext: 'Monthly usage',
      color: 'info',
    },
    {
      icon: BugReport,
      label: 'Issues',
      value: stats.totalIssues,
      subtext: 'Total issues',
      color: 'warning',
    },
    {
      icon: MergeType,
      label: 'Pull Requests',
      value: stats.totalPullRequests,
      subtext: 'Total PRs',
      color: 'error',
    },
  ];

  const getIconColor = (type: string): 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' => {
    switch (type) {
      case 'users':
        return 'primary';
      case 'repositories':
        return 'secondary';
      case 'issues':
        return 'warning';
      case 'pullRequests':
        return 'info';
      default:
        return 'primary';
    }
  };

  return (
    <Grid container spacing={3}>
      {STAT_CARDS.map(({ icon: Icon, label, value, subtext, color }) => (
        <Grid item xs={12} sm={6} md={4} key={label}>
          <Paper className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <Typography variant="h6" component="div">
                  {value}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  {label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {subtext}
                </Typography>
              </div>
              <Icon color={getIconColor(label.toLowerCase())} className="w-8 h-8" />
            </div>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}