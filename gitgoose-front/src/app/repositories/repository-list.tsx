'use client';

import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { Repository } from '@/types/repository';
import { Card, CardContent, Typography, Chip } from '@mui/material';
import Link from 'next/link';
import { Lock, LockOpen } from '@mui/icons-material';

const GET_REPOSITORIES = gql`
  query GetRepositories {
    repos {
      id
      name
      description
      isPrivate
      owner {
        id
        name
      }
      updatedAt
    }
  }
`;

export default function RepositoryList() {
  const { data, loading, error } = useQuery(GET_REPOSITORIES);

  if (loading) return null; // Handled by Suspense
  if (error) throw error; // Handled by error boundary

  return (
    <div className="grid gap-4">
      {data.repos.map((repo: Repository) => (
        <Link key={repo.id} href={`/repositories/${repo.id}`}>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent>
              <div className="flex items-center gap-2">
                <Typography variant="h6" component="h2">
                  {repo.name}
                </Typography>
                {repo.isPrivate ? (
                  <Lock className="text-gray-500" fontSize="small" />
                ) : (
                  <LockOpen className="text-gray-500" fontSize="small" />
                )}
              </div>
              {repo.description && (
                <Typography color="text.secondary" className="mt-2">
                  {repo.description}
                </Typography>
              )}
              <div className="flex gap-4 mt-4">
                <Typography variant="body2" color="text.secondary">
                  Updated {new Date(repo.updatedAt).toLocaleDateString()}
                </Typography>
                <Chip
                  label={repo.isPrivate ? 'Private' : 'Public'}
                  size="small"
                  variant="outlined"
                />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}