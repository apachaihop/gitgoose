'use client';

import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
} from '@mui/material';

export default function UserListSkeleton() {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>2FA</TableCell>
            <TableCell>Repositories</TableCell>
            <TableCell>Storage Used</TableCell>
            <TableCell>Last Active</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {[...Array(5)].map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Skeleton variant="circular" width={40} height={40} />
                  <div>
                    <Skeleton width={120} />
                    <Skeleton width={160} />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Skeleton width={80} />
              </TableCell>
              <TableCell>
                <Skeleton width={100} />
              </TableCell>
              <TableCell>
                <Skeleton width={40} />
              </TableCell>
              <TableCell>
                <Skeleton width={60} />
              </TableCell>
              <TableCell>
                <Skeleton width={80} />
              </TableCell>
              <TableCell>
                <Skeleton width={100} />
              </TableCell>
              <TableCell align="right">
                <Skeleton width={40} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}