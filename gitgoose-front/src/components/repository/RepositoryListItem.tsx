import {
  ListItem,
  ListItemText,
  Box,
  Typography,
  Chip,
  Link,
} from "@mui/material";
import { LockOutlined, Star, ForkRight, Visibility } from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import NextLink from "next/link";
import type { Repository } from "@/lib/types";
import { getMainLanguages, getLanguageColor } from "@/utils/languageUtils";

interface RepositoryListItemProps {
  repository: Repository;
}

export default function RepositoryListItem({
  repository,
}: RepositoryListItemProps) {
  const mainLanguages = repository.languageStatsEntities
    ? getMainLanguages(repository.languageStatsEntities)
    : [];

  return (
    <ListItem
      component={NextLink}
      href={`/${repository.owner.username}/${repository.name}`}
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        mb: 1,
        textDecoration: "none",
        "&:hover": {
          bgcolor: "action.hover",
        },
      }}
    >
      <ListItemText
        primary={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="h6">{repository.name}</Typography>
            {repository.isPrivate && (
              <LockOutlined fontSize="small" color="action" />
            )}
          </Box>
        }
        secondary={
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {repository.description || "No description provided"}
            </Typography>

            {/* Language Stats */}
            {mainLanguages.length > 0 && (
              <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
                {mainLanguages.map((lang) => (
                  <Box
                    key={lang.language}
                    sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                  >
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        bgcolor: getLanguageColor(lang.language),
                      }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {lang.language} {lang.percentage.toFixed(1)}%
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}

            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Star fontSize="small" />
                <Typography variant="body2" sx={{ ml: 0.5 }}>
                  {repository.starsCount}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <ForkRight fontSize="small" />
                <Typography variant="body2" sx={{ ml: 0.5 }}>
                  {repository.forksCount}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Visibility fontSize="small" />
                <Typography variant="body2" sx={{ ml: 0.5 }}>
                  {repository.watchersCount}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Updated {formatDistanceToNow(new Date(repository.updatedAt))}{" "}
                ago
              </Typography>
            </Box>
          </Box>
        }
      />
    </ListItem>
  );
}
