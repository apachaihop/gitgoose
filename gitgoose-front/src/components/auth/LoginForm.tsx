"use client";

import { useState } from "react";
import { Box, TextField, Button, Typography, Link } from "@mui/material";
import { useLogin } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/useAuthStore";
import Cookies from "js-cookie";
import GoogleAuthButton from "./GoogleAuthButton";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { setToken, setUser, setError } = useAuthStore();
  const [login, { loading }] = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await login({
        variables: {
          loginInput: {
            email,
            password,
          },
        },
      });
      if (!result.data?.login.user.isActive) {
        if (result.data?.login.access_token) {
          Cookies.set("token", result.data.login.access_token);
          setToken(result.data.login.access_token);
          setUser(result.data.login.user);
          router.replace("/repositories");
        }
      } else {
        setError("Your account is not active");
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <GoogleAuthButton />

      <Typography align="center" sx={{ mb: 2 }}>
        or
      </Typography>

      <TextField
        fullWidth
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{ mb: 3 }}
      />

      <Button
        fullWidth
        type="submit"
        variant="contained"
        disabled={loading}
        sx={{ mb: 2 }}
      >
        {loading ? "Logging in..." : "Login"}
      </Button>

      <Box sx={{ textAlign: "center" }}>
        <Typography>
          Don&apos;t have an account?{" "}
          <Link href="/register" underline="hover">
            Sign up
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
