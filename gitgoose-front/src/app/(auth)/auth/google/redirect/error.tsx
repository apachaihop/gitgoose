"use client";

import { useEffect } from "react";
import { Alert, Button, Box } from "@mui/material";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error in Google redirect:", error);
  }, [error]);

  return (
    <Box sx={{ p: 3 }}>
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={reset}>
            Try again
          </Button>
        }
      >
        Authentication Error: {error.message}
      </Alert>
    </Box>
  );
}
