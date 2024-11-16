'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import {
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Button,
} from '@mui/material';
import { Branch, BranchComparisonStats } from '@/types/branch';
import { useRouter } from 'next/navigation';

const GET_BRANCHES = gql`
  query GetBranches($repositoryId: ID!) {
    branches(repositoryId: $repositoryId) {
      name
      isDefault
    }
  }
`;

const COMPARE_BRANCHES = gql`
  query CompareBranches($repositoryId: ID!, $base: String!, $compare: String!) {
    compareBranches(repositoryId: $repositoryId, base: $base, compare: $compare) {
      aheadBy
      behindBy
      commits {
        sha
        message
        author {
          name
          email
        }
        date
      }
    }
  }
`;

export default function CompareBranchesPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const router = useRouter();
  const [baseBranch, setBaseBranch] = useState('');
  const [compareBranch, setCompareBranch] = useState('');

  const { data: branchesData } = useQuery(GET_BRANCHES, {
    variables: { repositoryId: params.id },
  });

  const { data: comparisonData } = useQuery(COMPARE_BRANCHES, {
    variables: { 
      repositoryId: params.id,
      base: baseBranch,
      compare: compareBranch,
    },
    skip: !baseBranch || !compareBranch,
  });

  const handleCreatePullRequest = () => {
    router.push(`/repositories/${params.id}/pull-requests/new?base=${baseBranch}&compare=${compareBranch}`);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Compare Branches</h1>

      <Paper className="p-6">
        <div className="flex gap-4 items-center">
          <FormControl fullWidth>
            <InputLabel>Base branch</InputLabel>
            <Select
              value={baseBranch}
              label="Base branch"
              onChange={(e) => setBaseBranch(e.target.value)}
            >
              {branchesData?.branches.map((branch: Branch) => (
                <MenuItem key={branch.name} value={branch.name}>
                  {branch.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography>←</Typography>

          <FormControl fullWidth>
            <InputLabel>Compare branch</InputLabel>
            <Select
              value={compareBranch}
              label="Compare branch"
              onChange={(e) => setCompareBranch(e.target.value)}
            >
              {branchesData?.branches.map((branch: Branch) => (
                <MenuItem key={branch.name} value={branch.name}>
                  {branch.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        {comparisonData && (
          <div className="mt-6">
            <div className="flex gap-4 mb-4">
              <Typography>
                <span className="font-bold">{comparisonData.compareBranches.aheadBy}</span> commits ahead
              </Typography>
              <Typography>
                <span className="font-bold">{comparisonData.compareBranches.behindBy}</span> commits behind
              </Typography>
            </div>

            <div className="space-y-4">
              {comparisonData.compareBranches.commits.map((commit: any) => (
                <Paper key={commit.sha} variant="outlined" className="p-4">
                  <Typography variant="h6">{commit.message}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {commit.author.name} committed {new Date(commit.date).toLocaleDateString()}
                  </Typography>
                </Paper>
              ))}
            </div>

            {comparisonData.compareBranches.aheadBy > 0 && (
              <div className="mt-6">
                <Button
                  variant="contained"
                  onClick={handleCreatePullRequest}
                >
                  Create Pull Request
                </Button>
              </div>
            )}
          </div>
        )}
      </Paper>
    </div>
  );
}