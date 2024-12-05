import { Box, Avatar, Typography, Button } from "@mui/material";
import { useMe, useLogout } from "@/lib/hooks/useAuth";
import LoadingSpinner from "../shared/LoadingSpinner";
import ErrorAlert from "../shared/ErrorAlert";
import NextLink from "next/link";
import { Link } from "@mui/material";

export default function UserProfile() {
  const { data, loading, error } = useMe();
  const logout = useLogout();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert error={error} />;
  if (!data?.me) return null;

  const { me: user } = data;

  const handleLogout = () => {
    logout();
  };

  return (
    <Box sx={{ p: 2, minWidth: 250 }}>
      <Link
        component={NextLink}
        href={`/${user.username}`}
        sx={{
          textDecoration: "none",
          color: "inherit",
          "&:hover": {
            textDecoration: "none",
            "& .MuiTypography-root": {
              color: "primary.main",
            },
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Avatar
            src={user.avatarUrl}
            alt={user.username}
            sx={{ width: 64, height: 64, mr: 2 }}
          />
          <Box>
            <Typography variant="h6">{user.name}</Typography>
            <Typography color="text.secondary">@{user.username}</Typography>
          </Box>
        </Box>
      </Link>

      {user.bio && <Typography sx={{ mb: 2 }}>{user.bio}</Typography>}

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        {user.location && (
          <Typography variant="body2">📍 {user.location}</Typography>
        )}
        {user.website && (
          <Typography variant="body2">🔗 {user.website}</Typography>
        )}
      </Box>

      <Button variant="outlined" color="error" onClick={handleLogout} fullWidth>
        Logout
      </Button>
    </Box>
  );
}
