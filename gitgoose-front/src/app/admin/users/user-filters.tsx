'use client';

import { useState } from 'react';
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  InputAdornment,
} from '@mui/material';
import { Search, FilterList, Clear } from '@mui/icons-material';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

const ROLES = ['admin', 'user', 'maintainer'];
const STATUSES = ['active', 'inactive', 'suspended'];

export default function UserFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [role, setRole] = useState(searchParams.get('role') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [team, setTeam] = useState(searchParams.get('team') || '');

  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    replace(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch('');
    setRole('');
    setStatus('');
    setTeam('');
    replace(pathname);
  };

  const hasFilters = search || role || status || team;

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-4 flex-wrap">
        <TextField
          placeholder="Search users..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            updateFilters({ q: e.target.value });
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />

        <FormControl>
          <InputLabel>Role</InputLabel>
          <Select
            value={role}
            label="Role"
            onChange={(e) => {
              setRole(e.target.value);
              updateFilters({ role: e.target.value });
            }}
            style={{ minWidth: 120 }}
          >
            <MenuItem value="">All</MenuItem>
            {ROLES.map((role) => (
              <MenuItem key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <InputLabel>Status</InputLabel>
          <Select
            value={status}
            label="Status"
            onChange={(e) => {
              setStatus(e.target.value);
              updateFilters({ status: e.target.value });
            }}
            style={{ minWidth: 120 }}
          >
            <MenuItem value="">All</MenuItem>
            {STATUSES.map((status) => (
              <MenuItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {hasFilters && (
          <Button
            variant="outlined"
            startIcon={<Clear />}
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {hasFilters && (
        <div className="flex gap-2 flex-wrap">
          {search && (
            <Chip
              label={`Search: ${search}`}
              onDelete={() => {
                setSearch('');
                updateFilters({ q: '' });
              }}
            />
          )}
          {role && (
            <Chip
              label={`Role: ${role}`}
              onDelete={() => {
                setRole('');
                updateFilters({ role: '' });
              }}
            />
          )}
          {status && (
            <Chip
              label={`Status: ${status}`}
              onDelete={() => {
                setStatus('');
                updateFilters({ status: '' });
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}