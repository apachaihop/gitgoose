"use client";

import { useMe } from "@/lib/hooks/useAuth";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { Typography } from "@mui/material";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function AdminPage() {
  const { data, loading } = useMe();

  if (loading) return <LoadingSpinner />;
  if (!data?.me?.isAdmin) {
    return <Typography>Access Denied</Typography>;
  }

  return <AdminDashboard />;
}
