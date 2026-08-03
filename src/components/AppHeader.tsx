import Link from "next/link";
import { Sprout, Bell, User } from "lucide-react";
import { signOut } from "@/app/(auth)/actions";

export function AppHeader({ name, role }: { name: string; role: string }) {
  return (
    <header className="sticky top-0 z-10 border-b border-black/5 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-forest">
          <Sprout size={22} /> DrukAgriLink
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-gray-500 sm:inline">{name} · {role}</span>
          <Link href="/notifications" aria-label="Notifications" className="text-forest"><Bell size={20} /></Link>
          <Link href="/profile" aria-label="Profile" className="text-forest"><User size={20} /></Link>
          <form action={signOut}><button className="text-crimson">Sign out</button></form>
        </div>
      </div>
    </header>
  );
}
