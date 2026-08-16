"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Toast = { id: number; title: string; body: string };

export function NotificationBell({ userId, initialUnread }: { userId: string; initialUnread: number }) {
  const [unread, setUnread] = useState(initialUnread);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("notifications-live")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setUnread((n) => n + 1);

          const row = payload.new as any;
          const toast: Toast = {
            id: Date.now(),
            title: row?.title ?? "New notification",
            body: row?.body ?? "",
          };
          // Show newest, cap at 3 stacked so it never floods the screen.
          setToasts((prev) => [toast, ...prev].slice(0, 3));
          // Auto-dismiss this toast after 4s.
          setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== toast.id));
          }, 4000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <>
      <Link href="/notifications" aria-label="Notifications" className="relative text-forest">
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-crimson px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Link>

      {/* Toast stack — fixed top-right, above everything */}
      <div className="pointer-events-none fixed right-4 top-20 z-50 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="toast-in pointer-events-auto overflow-hidden rounded-xl border border-black/5 bg-white p-4 shadow-lg"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-forest-dark">
                  <span className="inline-flex h-2 w-2 flex-none rounded-full bg-saffron" />
                  {t.title}
                </p>
                {t.body && <p className="mt-0.5 text-sm text-gray-600">{t.body}</p>}
              </div>
              <button onClick={() => dismiss(t.id)} className="flex-none text-gray-400 hover:text-forest" aria-label="Dismiss">
                <X size={16} />
              </button>
            </div>
            {/* Link to see all */}
            <Link href="/notifications" className="mt-2 inline-block text-xs font-semibold text-forest hover:underline">
              View notifications →
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}