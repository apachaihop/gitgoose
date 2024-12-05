import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Avatar,
} from "@mui/material";
import { useState } from "react";
import { useMutation } from "@apollo/client";
import { UPDATE_USER_PROFILE } from "@/lib/graphql/mutations/user";
import ErrorAlert from "../shared/ErrorAlert";

interface EditProfileDialogProps {
  open: boolean;
  onClose: () => void;
  user: {
    name: string;
    bio?: string;
    location?: string;
    website?: string;
    avatarUrl?: string;
  };
}

export default function EditProfileDialog({
  open,
  onClose,
  user,
}: EditProfileDialogProps) {
  const [formData, setFormData] = useState({
    name: user.name || "",
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
    avatarUrl: user.avatarUrl || "",
  });

  const [updateProfile, { loading, error }] = useMutation(UPDATE_USER_PROFILE, {
    onCompleted: () => {
      onClose();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      variables: {
        input: formData,
      },
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Profile</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && <ErrorAlert error={error} />}
          <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar src={formData.avatarUrl} sx={{ width: 64, height: 64 }} />
            <TextField
              label="Avatar URL"
              fullWidth
              value={formData.avatarUrl}
              onChange={(e) =>
                setFormData({ ...formData, avatarUrl: e.target.value })
              }
            />
          </Box>
          <TextField
            label="Name"
            fullWidth
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Bio"
            fullWidth
            multiline
            rows={3}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Location"
            fullWidth
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="Website"
            fullWidth
            value={formData.website}
            onChange={(e) =>
              setFormData({ ...formData, website: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            Save Changes
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
