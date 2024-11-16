export interface AdminUser {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
    role: string;
    status: 'active' | 'inactive' | 'suspended';
    createdAt: string;
    lastLogin: string;
    twoFactorEnabled: boolean;
    repositories: number;
    diskUsage: number;
    teams: string[];
  }
  
  export interface UserInvitation {
    id: string;
    email: string;
    role: string;
    inviter: {
      id: string;
      name: string;
    };
    createdAt: string;
    expiresAt: string;
    status: 'pending' | 'accepted' | 'expired';
  }