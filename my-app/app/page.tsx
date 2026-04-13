"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.replace("/home");
      } else {
        router.replace("/auth");
      }
    });
  }, [router]);

  return <div className="min-h-screen bg-white" />;
}
