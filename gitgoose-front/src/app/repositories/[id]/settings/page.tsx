'use client';

import { Suspense } from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { Paper, Typography } from '@mui/material';
import DangerZone from './danger-zone';
import CollaboratorSettings from './collaborator-settings';
import SettingsSkeleton from './settings-skeleton';

const GET_REPOSITORY = gql`
  query GetRepository($id: ID!) {
    repository(id: $id) {
      id
      name
    }
  }
`;

export default function SettingsPage({ params }: { params: { id: string } }) {
  const { data, loading, error } = useQuery(GET_REPOSITORY, {
    variables: { id: params.id },
  });

  if (loading || error) return <SettingsSkeleton />;

  return (
    <div className="space-y-6">
      <Typography variant="h4" gutterBottom>
        Repository Settings
      </Typography>

      <div className="grid gap-6">
        <section id="collaborators">
          <Suspense fallback={<SettingsSkeleton />}>
            <CollaboratorSettings repositoryId={params.id} />
          </Suspense>
        </section>

        <section id="danger">
          <Suspense fallback={<SettingsSkeleton />}>
            <DangerZone 
              repositoryId={params.id} 
              repositoryName={data.repository.name}
            />
          </Suspense>
        </section>
      </div>
    </div>
  );
}