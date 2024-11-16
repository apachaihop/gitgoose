'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  Divider,
  Alert,
  Box,
} from '@mui/material';
import { Google } from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';

export default function SignIn() {
  const router = useRouter();
  const { login, loginWithCredentials } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await loginWithCredentials(email, password);
      
      router.push('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth route
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Paper className="max-w-md w-full space-y-8 p-8">
        <div>
          <Typography variant="h4" align="center" gutterBottom>
            Sign in to GitGoose
          </Typography>
        </div>

        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <TextField
            required
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />

          <TextField
            required
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                color="primary"
              />
            }
            label="Remember me"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
          >
            Sign In
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
          onClick={handleGoogleLogin}
          className="bg-white"
        >
          Continue with Google
        </Button>

        <div className="mt-4 text-center">
          <Typography variant="body2" color="textSecondary">
            Don't have an account?{' '}
            <Button
              href="/signup"
              color="primary"
              className="font-medium"
            >
              Sign up
            </Button>
          </Typography>
        </div>
      </Paper>
    </div>
  );
}