'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import {
  List,
  ListItem,
  ListItemText,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Chip,
} from '@mui/material';

const GET_WEBHOOKS = gql`
  query GetWebhooks($repositoryId: ID!) {
    webhooks(repositoryId: $repositoryId) {
      id
      url
      events
      active
    }
  }
`;

export default function WebhookSettings({ repositoryId }: { repositoryId: string }) {
  const [open, setOpen] = useState(false);
  const { data, loading } = useQuery(GET_WEBHOOKS, {
    variables: { repositoryId },
  });

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Add Webhook</Button>
      <List>
        {data?.webhooks.map((webhook: any) => (
          <ListItem key={webhook.id}>
            <ListItemText
              primary={webhook.url}
              secondary={
                <div className="flex gap-2 mt-1">
                  {webhook.events.map((event: string) => (
                    <Chip key={event} label={event} size="small" />
                  ))}
                </div>
              }
            />
          </ListItem>
        ))}
      </List>
    </div>
  );
}