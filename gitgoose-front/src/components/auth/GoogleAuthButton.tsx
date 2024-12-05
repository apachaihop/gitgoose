import { Button } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";

export default function GoogleAuthButton() {
  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  return (
    <Button
      fullWidth
      variant="outlined"
      startIcon={<GoogleIcon />}
      onClick={handleGoogleLogin}
      sx={{ mb: 2 }}
    >
      Continue with Google
    </Button>
  );
}
