"use client";

import { Box, Container } from "@mui/material";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (token && pathname !== "/register") {
      router.replace("/repositories");
    }
  }, [token, router, pathname]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      <Container maxWidth="sm">{children}</Container>
    </Box>
  );
}
