'use client';

import { useState } from 'react';
import { Paper, Chip, TextField, InputAdornment } from '@mui/material';
import { Search, FilterList } from '@mui/icons-material';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { ActivityType } from '@/types/activity';

const ACTIVITY_TYPES: { type: ActivityType; label: string }[] = [
  { type: 'COMMIT', label: 'Commits' },
  { type: 'PULL_REQUEST', label: 'Pull Requests' },
  { type: 'ISSUE', label: 'Issues' },
  { type: 'RELEASE', label: 'Releases' },
  { type: 'FORK', label: 'Forks' },
  { type: 'BRANCH', label: 'Branches' },
  { type: 'COMMENT', label: 'Comments' },
  { type: 'REVIEW', label: 'Reviews' },
];

export default function ActivityFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const selectedTypes = new Set(searchParams.get('types')?.split(',') || []);

  const handleFilterChange = (type: ActivityType) => {
    const newTypes = new Set(selectedTypes);
    if (newTypes.has(type)) {
      newTypes.delete(type);
    } else {
      newTypes.add(type);
    }
    
    const params = new URLSearchParams(searchParams);
    if (newTypes.size > 0) {
      params.set('types', Array.from(newTypes).join(','));
    } else {
      params.delete('types');
    }
    replace(`${pathname}?${params.toString()}`);
  };

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('q', value);
    } else {
      params.delete('q');
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <Paper className="p-4 mb-6">
      <div className="space-y-4">
        <TextField
          fullWidth
          placeholder="Search activity..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            handleSearch(e.target.value);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />

        <div className="flex items-center gap-2 flex-wrap">
          <FilterList className="mr-2" />
          {ACTIVITY_TYPES.map(({ type, label }) => (
            <Chip
              key={type}
              label={label}
              onClick={() => handleFilterChange(type)}
              color={selectedTypes.has(type) ? 'primary' : 'default'}
              variant={selectedTypes.has(type) ? 'filled' : 'outlined'}
            />
          ))}
        </div>
      </div>
    </Paper>
  );
}