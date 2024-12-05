"use client";

import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { GitHub, Menu as MenuIcon } from "@mui/icons-material";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/useAuthStore";

export default function AuthHeader() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleGitHubLogin = () => {
    // Implement GitHub OAuth login
    console.log("GitHub login");
  };

  return (
    <AppBar
      position="fixed"
      color="transparent"
      elevation={0}
      sx={{ backdropFilter: "blur(8px)" }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: "space-between" }}>
          {/* Logo */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 700,
                cursor: "pointer",
                color: "primary.main",
              }}
              onClick={() => router.push("/")}
            >
              GitGoose
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {!user ? (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<GitHub />}
                    onClick={handleGitHubLogin}
                    sx={{ borderRadius: "20px" }}
                  >
                    Continue with GitHub
                  </Button>
                  <Divider orientation="vertical" flexItem />
                  <Button color="inherit" onClick={() => router.push("/login")}>
                    Sign in
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => router.push("/register")}
                    sx={{ borderRadius: "20px" }}
                  >
                    Create account
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    color="inherit"
                    onClick={() => router.push("/repositories")}
                  >
                    My Repositories
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => router.push("/new")}
                    sx={{ borderRadius: "20px" }}
                  >
                    New Repository
                  </Button>
                  <Button color="inherit" onClick={logout}>
                    Sign out
                  </Button>
                </>
              )}
            </Box>
          ) : (
            // Mobile Navigation
            <Box>
              <IconButton
                size="large"
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={handleMenu}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                {!user ? (
                  <>
                    <MenuItem
                      onClick={() => {
                        handleClose();
                        handleGitHubLogin();
                      }}
                    >
                      <GitHub sx={{ mr: 1 }} /> Continue with GitHub
                    </MenuItem>
                    <Divider />
                    <MenuItem
                      onClick={() => {
                        handleClose();
                        router.push("/login");
                      }}
                    >
                      Sign in
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleClose();
                        router.push("/register");
                      }}
                    >
                      Create account
                    </MenuItem>
                  </>
                ) : (
                  <>
                    <MenuItem
                      onClick={() => {
                        handleClose();
                        router.push("/repositories");
                      }}
                    >
                      My Repositories
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleClose();
                        router.push("/new");
                      }}
                    >
                      New Repository
                    </MenuItem>
                    <Divider />
                    <MenuItem
                      onClick={() => {
                        handleClose();
                        logout();
                      }}
                    >
                      Sign out
                    </MenuItem>
                  </>
                )}
              </Menu>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
