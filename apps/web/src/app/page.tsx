"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function RedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClientComponentClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push("/dashboard"); // already logged in
      } else {
        router.push("/signin"); // needs to sign in
      }
    });
  }, [router]);

  return null;
}
