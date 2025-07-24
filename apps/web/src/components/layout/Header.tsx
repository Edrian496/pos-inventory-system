"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { LogOut, User as UserIcon } from "lucide-react";
import Image from "next/image";

export default function Header() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && user.email) {
        setUserEmail(user.email);
        setAvatarUrl(user.user_metadata?.avatar_url || null);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/signin";
  };

  return (
    <header className="fixed md:static top-0 right-0 left-0 z-30 bg-white border-b shadow-sm px-4 md:px-6 py-4 flex justify-end md:justify-end items-center">
      <div className="relative">
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center gap-2 focus:outline-none"
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="Avatar"
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <UserIcon size={28} className="text-gray-600" />
          )}

          {/* Show email only in desktop (sm and up) */}
          <span className="text-sm text-gray-800 hidden sm:inline">
            {userEmail || "Loading..."}
          </span>
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg z-50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
