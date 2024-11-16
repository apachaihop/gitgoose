'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  TextField,
  Autocomplete,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

const GET_COLLABORATORS = gql`
  query GetCollaborators($repositoryId: ID!) {
    collaborators(repositoryId: $repositoryId) {
      id
      name
      role
    }
  }
`;

const ADD_COLLABORATOR = gql`
  mutation AddCollaborator($input: AddCollaboratorInput!) {
    addCollaborator(input: $input) {
      id
      name
      role
    }
  }
`;

export default function CollaboratorSettings({ repositoryId }: { repositoryId: string }) {
  const [open, setOpen] = useState(false);
  const { data, loading } = useQuery(GET_COLLABORATORS, {
    variables: { repositoryId },
  });
  const [addCollaborator] = useMutation(ADD_COLLABORATOR);

  // Component implementation...
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Add Collaborator</Button>
      <List>
        {data?.collaborators.map((collaborator: any) => (
          <ListItem key={collaborator.id}>
            <ListItemText
              primary={collaborator.name}
              secondary={collaborator.role}
            />
            <ListItemSecondaryAction>
              <IconButton edge="end">
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </div>
  );
}