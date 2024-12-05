import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  ListItemIcon,
  ListItemText,
  Link,
} from "@mui/material";
import {
  AccountCircle,
  Home,
  GitHub,
  AdminPanelSettings,
} from "@mui/icons-material";
import { useState } from "react";
import UserProfile from "@/components/auth/UserProfile";
import type { User } from "@/lib/types";

interface NavbarProps {
  user: User;
}

export default function Navbar({ user }: NavbarProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const menuItems = [
    { label: "Home", icon: <Home />, path: "/home" },
    { label: "Repositories", icon: <GitHub />, path: "/repositories" },

    // ... other menu items
  ];
  if (user.isAdmin) {
    menuItems.push({
      label: "Admin Dashboard",
      icon: <AdminPanelSettings />,
      path: "/admin",
    });
  }

  return (
    <AppBar position="static">
      <Toolbar>
        {menuItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <MenuItem>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ style: { color: "white" } }}
              />
            </MenuItem>
          </Link>
        ))}

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2" color="inherit">
            {user.username}
          </Typography>
          <IconButton size="large" onClick={handleMenu} color="inherit">
            {user.avatarUrl ? (
              <Avatar
                src={user.avatarUrl}
                alt={user.username}
                sx={{ width: 32, height: 32 }}
              />
            ) : (
              <AccountCircle />
            )}
          </IconButton>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <MenuItem sx={{ p: 0 }}>
            <UserProfile />
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
