'use client';

export const dynamic = 'force-dynamic';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  TextField,
  Paper,
  Typography,
  Divider,
  Alert,
  Box,
} from '@mui/material';
import { Google } from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { HTTP_ROUTES } from '../../../routes';

export default function SignUp() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register(formData);
      router.push('/repositories');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}${HTTP_ROUTES.AUTH.GOOGLE.AUTH.path}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <Paper className="p-8 w-full max-w-md space-y-6">
        <div className="text-center">
          <Typography variant="h4" component="h1" gutterBottom>
            Create an Account
          </Typography>
          <Typography color="textSecondary">
            Join GitGoose to collaborate on code
          </Typography>
        </div>

        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            fullWidth
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            autoComplete="name"
          />

          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            autoComplete="email"
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            autoComplete="new-password"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
          >
            Sign Up
          </Button>
        </form>

        <Box className="my-4">
          <Divider>
            <Typography variant="body2" color="textSecondary">
              OR
            </Typography>
          </Divider>
        </Box>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<Google />}
          onClick={handleGoogleSignUp}
          className="bg-white"
        >
          Continue with Google
        </Button>

        <Typography variant="body2" align="center" color="textSecondary">
          Already have an account?{' '}
          <Button
            href="/signin"
            color="primary"
          >
            Sign in
          </Button>
        </Typography>
      </Paper>
    </div>
  );
}