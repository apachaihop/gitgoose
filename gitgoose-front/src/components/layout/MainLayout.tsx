"use client";

import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Menu, GitHub, CallMerge, BugReport } from "@mui/icons-material";
import { useState } from "react";
import Link from "next/link";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            GitGoose
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <List>
          <ListItem component={Link} href="/repositories">
            <ListItemIcon>
              <GitHub />
            </ListItemIcon>
            <ListItemText primary="Repositories" />
          </ListItem>
          <ListItem component={Link} href="/pull-requests">
            <ListItemIcon>
              <CallMerge />
            </ListItemIcon>
            <ListItemText primary="Pull Requests" />
          </ListItem>
          <ListItem component={Link} href="/issues">
            <ListItemIcon>
              <BugReport />
            </ListItemIcon>
            <ListItemText primary="Issues" />
          </ListItem>
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
