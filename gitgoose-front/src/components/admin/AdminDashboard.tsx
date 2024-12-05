import {
  Box,
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import { AdminPanelSettings, Block, CheckCircle } from "@mui/icons-material";
import {
  useUserStats,
  useUsers,
  usePromoteToAdmin,
  useSuspendUser,
} from "@/lib/hooks/useAdmin";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { format } from "date-fns";

export default function AdminDashboard() {
  const { data: statsData, loading: statsLoading } = useUserStats();
  const { data: usersData, loading: usersLoading } = useUsers();
  const [promoteToAdmin] = usePromoteToAdmin();
  const [suspendUser] = useSuspendUser();

  if (statsLoading || usersLoading) return <LoadingSpinner />;

  const handlePromoteToAdmin = async (userId: string) => {
    try {
      await promoteToAdmin({
        variables: {
          userId,
          roles: ["ADMIN"],
        },
      });
    } catch (error) {
      console.error("Error promoting user:", error);
    }
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      await suspendUser({
        variables: { userId },
      });
    } catch (error) {
      console.error("Error suspending user:", error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Total Users</Typography>
            <Typography variant="h4">
              {statsData?.userStats.totalUsers}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Active Users</Typography>
            <Typography variant="h4">
              {statsData?.userStats.activeUsers}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Admin Users</Typography>
            <Typography variant="h4">
              {statsData?.userStats.adminUsers}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Inactive Users</Typography>
            <Typography variant="h4">
              {statsData?.userStats.inactiveUsers}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Roles</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usersData?.users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={user.isActive ? "Active" : "Suspended"}
                    color={user.isActive ? "success" : "error"}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {user.roles.map((role) => (
                    <Chip
                      key={role}
                      label={role}
                      size="small"
                      sx={{ mr: 0.5 }}
                    />
                  ))}
                </TableCell>
                <TableCell>
                  {format(new Date(user.createdAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  {!user.isAdmin && (
                    <Tooltip title="Promote to Admin">
                      <IconButton
                        onClick={() => handlePromoteToAdmin(user.id)}
                        color="primary"
                      >
                        <AdminPanelSettings />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip
                    title={user.isActive ? "Suspend User" : "Activate User"}
                  >
                    <IconButton
                      onClick={() => handleSuspendUser(user.id)}
                      color={user.isActive ? "error" : "success"}
                    >
                      {user.isActive ? <Block /> : <CheckCircle />}
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
