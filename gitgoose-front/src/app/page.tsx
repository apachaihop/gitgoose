"use client";

import AuthHeader from "@/components/auth/AuthHeader";
import AuthHero from "@/components/auth/AuthHero";
import { Box, Container, Typography, Button, Grid, Card } from "@mui/material";
import { GitHub, Code, Lock, Speed } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useEffect } from "react";

export default function LandingPage() {
  const router = useRouter();
  const { token } = useAuthStore();

  // Redirect if already logged in
  useEffect(() => {
    if (token) {
      router.push("/repositories");
    }
  }, [token, router]);

  const features = [
    {
      icon: <GitHub sx={{ fontSize: 40 }} />,
      title: "Git-Based Version Control",
      description:
        "Powerful version control system for your code with branch management and merge capabilities.",
    },
    {
      icon: <Code sx={{ fontSize: 40 }} />,
      title: "Code Collaboration",
      description:
        "Work together seamlessly with pull requests, code reviews, and inline comments.",
    },
    {
      icon: <Lock sx={{ fontSize: 40 }} />,
      title: "Secure Repository",
      description:
        "Keep your code safe with private repositories and granular access controls.",
    },
    {
      icon: <Speed sx={{ fontSize: 40 }} />,
      title: "Fast Performance",
      description: "Lightning-fast code browsing and repository operations.",
    },
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AuthHeader />
      <AuthHero />

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          textAlign="center"
          gutterBottom
          sx={{ mb: 6 }}
        >
          Features
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  p: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                  },
                }}
              >
                <Box sx={{ color: "primary.main", mb: 2 }}>{feature.icon}</Box>
                <Typography variant="h6" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography color="text.secondary">
                  {feature.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: "background.paper", py: 8 }}>
        <Container maxWidth="md">
          <Box
            sx={{
              textAlign: "center",
              p: 4,
              borderRadius: 2,
              bgcolor: "primary.main",
              color: "primary.contrastText",
            }}
          >
            <Typography variant="h4" gutterBottom>
              Ready to get started?
            </Typography>
            <Typography sx={{ mb: 3 }}>
              Join thousands of developers who are already using GitGoose
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={() => router.push("/register")}
            >
              Create Free Account
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 4,
          bgcolor: "background.paper",
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <Container maxWidth="lg">
          <Typography textAlign="center" color="text.secondary">
            © {new Date().getFullYear()} GitGoose. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
