import { Card, CardContent, Typography, Box } from "@mui/material";
import { Star, LockOutlined } from "@mui/icons-material";
import Link from "next/link";
import { getLanguageColor } from "@/utils/languageUtils";
import type { Repository } from "@/lib/types";

interface TrendingRepositoryCardProps {
  repository: Repository;
}

export default function TrendingRepositoryCard({
  repository,
}: TrendingRepositoryCardProps) {
  const mainLanguage = repository.languageStatsEntities?.[0];

  return (
    <Card
      component={Link}
      href={`/${repository.owner.username}/${repository.name}`}
      sx={{
        textDecoration: "none",
        "&:hover": {
          transform: "translateY(-2px)",
          transition: "transform 0.2s",
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
            <Typography variant="subtitle1" sx={{ mr: 1 }}>
              {repository.owner.username}/{repository.name}
            </Typography>
            {repository.isPrivate && (
              <LockOutlined fontSize="small" color="action" />
            )}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Star fontSize="small" />
            <Typography variant="body2" sx={{ ml: 0.5 }}>
              {repository.starsCount}
            </Typography>
          </Box>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {repository.description || "No description provided"}
        </Typography>

        {mainLanguage && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                bgcolor: getLanguageColor(mainLanguage.language),
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {mainLanguage.language}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
