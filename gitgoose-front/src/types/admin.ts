export interface AdminStats {
    totalUsers: number;
    activeUsers: number;
    totalRepositories: number;
    storageUsed: number;
    bandwidthUsed: number;
    totalIssues: number;
    totalPullRequests: number;
  }
  
  export interface UserRole {
    id: string;
    name: string;
    permissions: string[];
  }
  
  export interface AuditLog {
    id: string;
    action: string;
    actor: {
      id: string;
      name: string;
      avatarUrl: string;
    };
    target: {
      id: string;
      type: string;
      name: string;
    };
    timestamp: string;
    ipAddress: string;
    metadata: Record<string, any>;
  }
  
  export interface SystemHealth {
    status: 'healthy' | 'degraded' | 'down';
    services: {
      name: string;
      status: 'up' | 'down';
      latency: number;
      lastChecked: string;
    }[];
    metrics: {
      cpuUsage: number;
      memoryUsage: number;
      diskUsage: number;
      queueSize: number;
    };
  }
  
  export type StatType = 'users' | 'repositories' | 'issues' | 'pullRequests';
  
  export interface AdminStat {
    type: StatType;
    value: number;
    label: string;
    change: number;
  }