"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import { REGISTER_MUTATION } from "@/lib/graphql/mutations/auth";
import { useAuthStore } from "@/lib/store/useAuthStore";
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Link,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
});

type RegisterInputs = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { setError, error: authError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInputs>({
    resolver: zodResolver(registerSchema),
  });

  const [registerUser, { loading }] = useMutation(REGISTER_MUTATION, {
    onCompleted: () => {
      router.push("/login?registered=true");
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const onSubmit = async (data: RegisterInputs) => {
    try {
      await registerUser({
        variables: {
          createUserInput: {
            email: data.email,
            username: data.username,
            password: data.password,
            name: data.name,
            bio: data.bio || null,
            location: data.location || null,
            website: data.website || null,
          },
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  return (
    <Card sx={{ p: 4, width: "100%", maxWidth: 500 }}>
      <Typography variant="h4" textAlign="center" gutterBottom>
        Create Account
      </Typography>

      <GoogleAuthButton />

      <Typography align="center" sx={{ mb: 2 }}>
        or
      </Typography>

      {authError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {authError}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: "grid", gap: 2 }}>
          <TextField
            label="Email"
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          <TextField
            label="Username"
            {...register("username")}
            error={!!errors.username}
            helperText={errors.username?.message}
          />

          <TextField
            label="Password"
            type="password"
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
          />

          <TextField
            label="Full Name"
            {...register("name")}
            error={!!errors.name}
            helperText={errors.name?.message}
          />

          <TextField
            label="Bio"
            multiline
            rows={3}
            {...register("bio")}
            error={!!errors.bio}
            helperText={errors.bio?.message}
          />

          <TextField
            label="Location"
            {...register("location")}
            error={!!errors.location}
            helperText={errors.location?.message}
          />

          <TextField
            label="Website"
            {...register("website")}
            error={!!errors.website}
            helperText={errors.website?.message}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ mt: 1 }}
          >
            {loading ? <CircularProgress size={24} /> : "Create Account"}
          </Button>
        </Box>
      </form>

      <Box sx={{ mt: 3, textAlign: "center" }}>
        <Typography>
          Already have an account?{" "}
          <Link href="/login" underline="hover">
            Sign in
          </Link>
        </Typography>
      </Box>
    </Card>
  );
}
