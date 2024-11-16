'use client';

import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  CheckCircle,
  Warning,
  Error,
  Memory,
  Storage as StorageIcon,
  Queue,
} from '@mui/icons-material';

const GET_SYSTEM_HEALTH = gql`
  query GetSystemHealth {
    systemHealth {
      status
      services {
        name
        status
        latency
        lastChecked
      }
      metrics {
        cpuUsage
        memoryUsage
        diskUsage
        queueSize
      }
    }
  }
`;

interface SystemService {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  latency: number;
  lastChecked: string;
}

export default function SystemStatus() {
  const { data, loading, error } = useQuery(GET_SYSTEM_HEALTH, {
    pollInterval: 30000, // Poll every 30 seconds
  });

  if (loading || error) return null;

  const { status, services, metrics } = data.systemHealth;

  const getStatusIcon = (status: string): JSX.Element => {
    switch (status) {
      case 'healthy':
        return <CheckCircle />;
      case 'degraded':
        return <Warning />;
      case 'down':
        return <Error />;
      default:
        return <Warning />;
    }
  };

  return (
    <Paper className="p-4">
      <div className="flex items-center justify-between mb-4">
        <Typography variant="h6">System Status</Typography>
        <Chip
          icon={getStatusIcon(status)}
          label={status.toUpperCase()}
          color={
            status === 'healthy'
              ? 'success'
              : status === 'degraded'
              ? 'warning'
              : 'error'
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Memory />
          <div>
            <Typography variant="body2" color="text.secondary">
              CPU Usage
            </Typography>
            <Typography variant="h6">
              {metrics.cpuUsage.toFixed(1)}%
            </Typography>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StorageIcon />
          <div>
            <Typography variant="body2" color="text.secondary">
              Memory Usage
            </Typography>
            <Typography variant="h6">
              {metrics.memoryUsage.toFixed(1)}%
            </Typography>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StorageIcon />
          <div>
            <Typography variant="body2" color="text.secondary">
              Disk Usage
            </Typography>
            <Typography variant="h6">
              {metrics.diskUsage.toFixed(1)}%
            </Typography>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Queue />
          <div>
            <Typography variant="body2" color="text.secondary">
              Queue Size
            </Typography>
            <Typography variant="h6">{metrics.queueSize}</Typography>
          </div>
        </div>
      </div>

      <Typography variant="subtitle2" className="mb-2">
        Services
      </Typography>
      <List>
        {services.map((service: SystemService) => (
          <ListItem key={service.name}>
            <ListItemIcon>{getStatusIcon(service.status)}</ListItemIcon>
            <ListItemText
              primary={service.name}
              secondary={`${service.latency}ms - Last checked ${new Date(
                service.lastChecked
              ).toLocaleTimeString()}`}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}