"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function NotificationBell({ userId, initialUnread }: { userId: string; initialUnread: number }) {
  const [unread, setUnread] = useState(initialUnread);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("notifications-live")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "publicpasted ",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // A new notification for this user arrived — bump the badge live.
          setUnread((n) => n + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <Link href="/notifications" aria-label="Notifications" className="relative text-forest">
      <Bell size={20} />
      {unread > 0 && (
        <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-crimson px-1 text-[10px] font-bold text-white">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}