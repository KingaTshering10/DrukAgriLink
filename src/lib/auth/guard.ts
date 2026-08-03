import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/auth/roles";
import type { Profile } from "@/lib/types/db";

// Returns the signed-in user's profile or redirects to /login.
export async function getProfile(): Promise<Profile> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!data) redirect("/register");
  return data as Profile;
}

// Enforces a role server-side (defense in depth, not just hidden UI).
export async function requireRole(role: Role): Promise<Profile> {
  const profile = await getProfile();
  if (profile.role !== role) redirect("/access-denied");
  return profile;
}
