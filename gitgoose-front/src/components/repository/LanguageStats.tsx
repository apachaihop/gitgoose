import {
  getLanguageColor,
  getAllLanguages,
  getMainLanguages,
} from "@/utils/languageUtils";
import { Box, Typography, LinearProgress } from "@mui/material";

interface LanguageStatsProps {
  languageStatsEntities?: Array<{
    language: string;
    percentage: number;
    bytes: number;
  }>;
  showAll?: boolean;
}

export default function LanguageStats({
  languageStatsEntities,
  showAll = false,
}: LanguageStatsProps) {
  const languages = showAll
    ? getAllLanguages(languageStatsEntities)
    : getMainLanguages(languageStatsEntities);

  if (!languageStatsEntities?.length) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          No language statistics available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Languages
      </Typography>
      {languages.map((lang) => (
        <Box key={lang.language} sx={{ mb: 1 }}>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
          >
            <Typography variant="body2">{lang.language}</Typography>
            <Typography variant="body2">
              {lang.percentage.toFixed(1)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={lang.percentage}
            sx={{
              height: 8,
              borderRadius: 1,
              bgcolor: "grey.200",
              "& .MuiLinearProgress-bar": {
                bgcolor: getLanguageColor(lang.language),
              },
            }}
          />
        </Box>
      ))}
    </Box>
  );
}
