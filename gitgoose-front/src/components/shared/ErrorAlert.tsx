import { Alert, AlertTitle } from "@mui/material";
import { ApolloError } from "@apollo/client";

interface ErrorAlertProps {
  error?: ApolloError;
  message?: string;
}

export default function ErrorAlert({ error, message }: ErrorAlertProps) {
  const errorMessage = error?.message || message || "An error occurred";

  return (
    <Alert severity="error" sx={{ mt: 2 }}>
      <AlertTitle>Error</AlertTitle>
      {errorMessage}
    </Alert>
  );
}
