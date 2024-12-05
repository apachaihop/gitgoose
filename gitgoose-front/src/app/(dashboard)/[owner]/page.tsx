"use client";

import {
  Box,
  Paper,
  Typography,
  Avatar,
  Grid,
  Tabs,
  Tab,
  Divider,
  Button,
} from "@mui/material";
import { useQuery } from "@apollo/client";
import { GET_USER_BY_USERNAME } from "@/lib/graphql/queries/user";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorAlert from "@/components/shared/ErrorAlert";
import { useState } from "react";
import RepositoryList from "@/components/repository/RepositoryList";
import { useMe } from "@/lib/hooks/useAuth";
import { useAuthStore } from "@/lib/store/useAuthStore";
import EditProfileDialog from "@/components/user/EditProfileDialog";

interface Props {
  params: {
    owner: string;
  };
}

export default function UserProfilePage({ params: { owner } }: Props) {
  const [activeTab, setActiveTab] = useState(0);
  const { data: meData } = useMe();
  const isCurrentUser = meData?.me?.username === owner;

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", py: 4 }}>
      <Paper sx={{ p: 4 }}>
        {isCurrentUser ? (
          <CurrentUserProfile
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        ) : (
          <OtherUserProfile
            username={owner}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        )}
      </Paper>
    </Box>
  );
}

function CurrentUserProfile({ activeTab, setActiveTab }) {
  const { data, loading, error } = useMe();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert error={error} />;
  if (!data?.me) return null;

  const user = data.me;

  return (
    <ProfileContent
      user={user}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    />
  );
}

function OtherUserProfile({ username, activeTab, setActiveTab }) {
  const { data, loading, error } = useQuery(GET_USER_BY_USERNAME, {
    variables: { username },
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert error={error} />;
  if (!data?.userByUsername) return <Typography>User not found</Typography>;

  return (
    <ProfileContent
      user={data.userByUsername}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    />
  );
}

function ProfileContent({ user, activeTab, setActiveTab }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { user: currentUser } = useAuthStore();
  const isOwnProfile = currentUser?.id === user.id;

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "flex-start", mb: 4 }}>
        <Avatar src={user.avatarUrl} sx={{ width: 150, height: 150, mr: 4 }} />
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box>
              <Typography variant="h4">{user.name}</Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                @{user.username}
              </Typography>
            </Box>
            {isOwnProfile && (
              <Button
                variant="outlined"
                onClick={() => setIsEditDialogOpen(true)}
              >
                Edit Profile
              </Button>
            )}
          </Box>
          {user.bio && (
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {user.bio}
            </Typography>
          )}
          <Box sx={{ display: "flex", gap: 2 }}>
            {user.location && (
              <Typography variant="body2">📍 {user.location}</Typography>
            )}
            {user.website && (
              <Typography variant="body2">
                🔗{" "}
                <a
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {user.website}
                </a>
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {isOwnProfile && (
        <EditProfileDialog
          open={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          user={user}
        />
      )}

      <Divider sx={{ mb: 2 }} />

      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Repositories" />
        <Tab label="Activity" />
        <Tab label="Stars" />
      </Tabs>

      {activeTab === 0 && <RepositoryList username={user.username} />}
      {activeTab === 1 && <Typography>Activity feed coming soon...</Typography>}
      {activeTab === 2 && (
        <Typography>Starred repositories coming soon...</Typography>
      )}
    </>
  );
}
