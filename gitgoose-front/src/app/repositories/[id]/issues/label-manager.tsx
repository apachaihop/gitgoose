'use client';

import { useState } from 'react';
import { 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
} from '@mui/material';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { Edit, Delete, Label } from '@mui/icons-material';
import { ChromePicker } from 'react-color';

const GET_LABELS = gql`
  query GetLabels($repositoryId: ID!) {
    labels(repositoryId: $repositoryId) {
      id
      name
      color
      description
    }
  }
`;

const CREATE_LABEL = gql`
  mutation CreateLabel($input: CreateLabelInput!) {
    createLabel(input: $input) {
      id
      name
      color
    }
  }
`;

const DELETE_LABEL = gql`
  mutation DeleteLabel($id: ID!) {
    deleteLabel(id: $id)
  }
`;

export default function LabelManager({ repositoryId }: { repositoryId: string }) {
  const [open, setOpen] = useState(false);
  const [newLabel, setNewLabel] = useState({ name: '', color: '#000000', description: '' });

  const { data, loading } = useQuery(GET_LABELS, {
    variables: { repositoryId },
  });

  const [createLabel] = useMutation(CREATE_LABEL, {
    refetchQueries: ['GetLabels'],
  });

  const [deleteLabel] = useMutation(DELETE_LABEL, {
    refetchQueries: ['GetLabels'],
  });

  const handleCreateLabel = async () => {
    await createLabel({
      variables: {
        input: {
          ...newLabel,
          repositoryId,
        },
      },
    });
    setNewLabel({ name: '', color: '#000000', description: '' });
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<Label />}
        onClick={() => setOpen(true)}
      >
        Labels
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Manage Labels</DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-4">
            <div className="flex gap-4">
              <TextField
                label="Name"
                value={newLabel.name}
                onChange={(e) => setNewLabel({ ...newLabel, name: e.target.value })}
                size="small"
              />
              <ChromePicker
                color={newLabel.color}
                onChange={(color) => setNewLabel({ ...newLabel, color: color.hex })}
              />
            </div>
            <TextField
              fullWidth
              label="Description"
              value={newLabel.description}
              onChange={(e) => setNewLabel({ ...newLabel, description: e.target.value })}
              size="small"
            />
            <Button
              variant="contained"
              onClick={handleCreateLabel}
              disabled={!newLabel.name}
            >
              Create Label
            </Button>
          </div>

          <List className="mt-4">
            {data?.labels.map((label: any) => (
              <ListItem
                key={label.id}
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={() => deleteLabel({ variables: { id: label.id } })}
                  >
                    <Delete />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={
                    <div className="flex items-center gap-2">
                      <Chip
                        label={label.name}
                        style={{ backgroundColor: label.color }}
                      />
                      {label.description}
                    </div>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}