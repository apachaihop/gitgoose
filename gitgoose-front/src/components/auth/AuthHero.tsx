"use client";

import {
  Box,
  Button,
  Card,
  Container,
  Typography,
  Divider,
  useTheme,
} from "@mui/material";
import { GitHub } from "@mui/icons-material";
import { useRouter } from "next/navigation";

export default function AuthHero() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Box
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
        color: "white",
        py: { xs: 8, md: 12 },
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            gap: 6,
          }}
        >
          {/* Hero Content */}
          <Box sx={{ flex: 1, textAlign: { xs: "center", md: "left" } }}>
            <Typography variant="h2" component="h1" gutterBottom>
              Where Code Lives
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
              Collaborate, code, and create with GitGoose - your modern Git
              platform
            </Typography>
          </Box>

          {/* Auth Card */}
          <Card
            sx={{
              p: 4,
              width: { xs: "100%", sm: "400px" },
              backdropFilter: "blur(8px)",
              bgcolor: "background.paper",
            }}
          >
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<GitHub />}
              onClick={() => console.log("GitHub login")}
              sx={{ mb: 3 }}
            >
              Continue with GitHub
            </Button>

            <Divider sx={{ mb: 3 }}>
              <Typography color="text.secondary">or</Typography>
            </Divider>

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={() => router.push("/register")}
              sx={{ mb: 2 }}
            >
              Create an account
            </Button>

            <Typography align="center" sx={{ mt: 2 }}>
              Already have an account?{" "}
              <Button
                color="primary"
                onClick={() => router.push("/login")}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                Sign in
              </Button>
            </Typography>
          </Card>
        </Box>
      </Container>
    </Box>
  );
}
