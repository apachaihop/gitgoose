"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/store/useAuthStore";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import Cookies from "js-cookie";
import { useMe } from "@/lib/hooks/useAuth";
import { Alert } from "@mui/material";

export default function GoogleRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setToken, setUser, setError } = useAuthStore();
  const { refetch } = useMe();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const token = searchParams.get("token");
        console.log("Received token:", token?.substring(0, 20) + "...");

        if (!token) {
          console.error("No token received");
          setError("No authentication token received");
          router.replace("/login");
          return;
        }

        // First try to set the cookie
        try {
          Cookies.set("token", token, {
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
          });
          console.log("Cookie set successfully");
        } catch (cookieError) {
          console.error("Cookie setting error:", cookieError);
          setError("Failed to save authentication token");
          router.replace("/login");
          return;
        }

        // Then set the token in the store
        try {
          setToken(token);
          console.log("Token set in store successfully");
        } catch (storeError) {
          console.error("Store setting error:", storeError);
          setError("Failed to save authentication state");
          router.replace("/login");
          return;
        }

        // Finally fetch user data
        try {
          console.log("Fetching user data...");
          const { data } = await refetch();
          console.log("User data received:", data);

          if (data?.me) {
            setUser(data.me);
            router.replace("/home");
          } else {
            throw new Error("No user data received");
          }
        } catch (userError) {
          console.error("User data fetch error:", userError);
          setError("Failed to fetch user data");
          router.replace("/login");
        }
      } catch (error) {
        console.error("Top level error:", error);
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
        router.replace("/login");
      }
    };

    handleRedirect();
  }, [searchParams, router, setToken, setUser, setError, refetch]);

  return (
    <div style={{ padding: "20px" }}>
      <LoadingSpinner />
      <Alert severity="info" sx={{ mt: 2 }}>
        Processing authentication...
      </Alert>
    </div>
  );
}
