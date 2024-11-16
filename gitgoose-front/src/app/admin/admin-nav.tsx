'use client';

import { Paper } from '@mui/material';
import {
  Dashboard,
  People,
  Storage,
  Security,
  Settings,
  Assessment,
  History,
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const NAV_ITEMS = [
  { href: '/admin', icon: Dashboard, label: 'Dashboard' },
  { href: '/admin/users', icon: People, label: 'User Management' },
  { href: '/admin/repositories', icon: Storage, label: 'Repositories' },
  { href: '/admin/security', icon: Security, label: 'Security' },
  { href: '/admin/audit-log', icon: History, label: 'Audit Log' },
  { href: '/admin/analytics', icon: Assessment, label: 'Analytics' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <Paper className="w-64 p-4">
      <nav className="space-y-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              'flex items-center gap-2 p-2 rounded transition-colors',
              pathname === href
                ? 'bg-primary-50 text-primary-600'
                : 'hover:bg-gray-100'
            )}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        ))}
      </nav>
    </Paper>
  );
}