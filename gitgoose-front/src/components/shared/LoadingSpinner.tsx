import { Box, CircularProgress, Typography } from "@mui/material";

export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "200px",
      }}
    >
      <CircularProgress size={40} />
      <Typography sx={{ mt: 2 }} color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}
