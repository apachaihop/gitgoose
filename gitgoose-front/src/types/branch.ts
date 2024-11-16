export interface Branch {
    name: string;
    isDefault: boolean;
    protected: boolean;
    lastCommit: {
      sha: string;
      message: string;
      author: {
        name: string;
        email: string;
      }
      date: string;
    }
    branchProtectionRules?: {
      requiresApproval: boolean;
      requiredApproverCount: number;
      requiresStatusChecks: boolean;
      restrictPushes: boolean;
      allowForcePushes: boolean;
    }
  }
  
  export interface BranchComparisonStats {
    aheadBy: number;
    behindBy: number;
    commits: Array<{
      sha: string;
      message: string;
      author: {
        name: string;
        email: string;
      }
      date: string;
    }>
  }