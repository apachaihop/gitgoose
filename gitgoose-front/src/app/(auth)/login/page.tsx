"use client";

import { Card, Typography, Alert } from "@mui/material";
import LoginForm from "@/components/auth/LoginForm";
import { useAuthStore } from "@/lib/store/useAuthStore";

export default function LoginPage() {
  const { error } = useAuthStore();

  return (
    <Card sx={{ p: 4 }}>
      <Typography variant="h4" textAlign="center" gutterBottom>
        Welcome Back
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <LoginForm />
    </Card>
  );
}
