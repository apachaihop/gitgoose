import { Card, CardContent, Typography, Box, Chip } from "@mui/material";
import { Star, ForkRight, Visibility, LockOutlined } from "@mui/icons-material";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import type { Repository } from "@/lib/types";
import { getMainLanguages, getLanguageColor } from "@/utils/languageUtils";

interface RepositoryCardProps {
  repository: Repository;
}

export default function RepositoryCard({ repository }: RepositoryCardProps) {
  const mainLanguages = repository.languageStatsEntities
    ? getMainLanguages(repository.languageStatsEntities)
    : [];

  return (
    <Card
      component={Link}
      href={`/${repository.owner.username}/${repository.name}`}
      sx={{
        textDecoration: "none",
        minHeight: 200,
        "&:hover": {
          transform: "translateY(-2px)",
          transition: "transform 0.2s",
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography variant="h6" sx={{ mr: 1 }}>
            {repository.name}
          </Typography>
          {repository.isPrivate && (
            <LockOutlined fontSize="small" color="action" />
          )}
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {repository.description || "No description provided"}
        </Typography>

        <Box sx={{ mb: 2 }}>
          {mainLanguages.length > 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {mainLanguages.map((lang) => (
                <Box
                  key={lang.language}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      bgcolor: getLanguageColor(lang.language),
                    }}
                  />
                  <Typography variant="body2">
                    {lang.language} {lang.percentage.toFixed(1)}%
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No language statistics available
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 2, mt: "auto" }}>
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
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ ml: "auto" }}
          >
            Updated {formatDistanceToNow(new Date(repository.updatedAt))} ago
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
