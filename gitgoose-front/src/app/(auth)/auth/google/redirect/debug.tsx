"use client";

import { useSearchParams } from "next/navigation";

export default function DebugParams() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  console.log(
    "Debug - searchParams:",
    Object.fromEntries(searchParams.entries())
  );
  console.log("Debug - token:", token);

  return null;
}
