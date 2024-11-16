'use client';

import { useState } from 'react';
import { 
  Paper, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl,
  InputLabel,
  Chip,
  Autocomplete,
} from '@mui/material';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { IssueLabel } from '@/types/issue';

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

export default function IssueFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [state, setState] = useState(searchParams.get('state') || 'open');
  const [author, setAuthor] = useState(searchParams.get('author') || '');
  const [selectedLabels, setSelectedLabels] = useState<IssueLabel[]>([]);

  const { data: labelsData } = useQuery(GET_LABELS, {
    variables: { repositoryId: pathname.split('/')[2] },
  });

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <Paper className="p-4 mb-6">
      <div className="flex gap-4 items-center flex-wrap">
        <FormControl size="small" className="min-w-[200px]">
          <InputLabel>State</InputLabel>
          <Select
            value={state}
            label="State"
            onChange={(e) => {
              setState(e.target.value);
              handleFilterChange('state', e.target.value);
            }}
          >
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
            <MenuItem value="all">All</MenuItem>
          </Select>
        </FormControl>

        <TextField
          size="small"
          label="Author"
          value={author}
          onChange={(e) => {
            setAuthor(e.target.value);
            handleFilterChange('author', e.target.value);
          }}
        />

        <Autocomplete
          multiple
          size="small"
          options={labelsData?.labels || []}
          value={selectedLabels}
          onChange={(_, newValue) => {
            setSelectedLabels(newValue);
            handleFilterChange('labels', newValue.map(l => l.id).join(','));
          }}
          getOptionLabel={(option) => option.name}
          renderInput={(params) => (
            <TextField {...params} label="Labels" className="min-w-[200px]" />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                label={option.name}
                {...getTagProps({ index })}
                style={{ backgroundColor: option.color }}
              />
            ))
          }
        />

        {(state !== 'open' || author || selectedLabels.length > 0) && (
          <Chip 
            label="Clear filters" 
            onDelete={() => {
              setState('open');
              setAuthor('');
              setSelectedLabels([]);
              replace(pathname);
            }}
          />
        )}
      </div>
    </Paper>
  );
}