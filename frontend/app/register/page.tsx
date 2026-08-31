"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthSession } from "../../lib/api";

export default function RegisterRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(getAuthSession() ? "/dashboard" : "/signup");
  }, [router]);

  return <main className="min-h-[100dvh] bg-[var(--background)]" aria-busy="true" />;
}