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
} from '@mui/material';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

export default function PullRequestFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [state, setState] = useState(searchParams.get('state') || 'open');
  const [author, setAuthor] = useState(searchParams.get('author') || '');

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
      <div className="flex gap-4 items-center">
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
            <MenuItem value="merged">Merged</MenuItem>
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

        <div className="flex gap-2">
          {(state !== 'open' || author) && (
            <Chip 
              label="Clear filters" 
              onDelete={() => {
                setState('open');
                setAuthor('');
                replace(pathname);
              }}
            />
          )}
        </div>
      </div>
    </Paper>
  );
}