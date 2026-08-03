"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ROLE_HOME, ROLES, type Role } from "@/lib/auth/roles";

export async function signIn(_prev: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Invalid email or password." };
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  redirect(profile ? ROLE_HOME[profile.role as Role] : "/register");
}

export async function signUp(_prev: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const full_name = String(formData.get("full_name") ?? "");
  const role = String(formData.get("role") ?? "") as Role;
  if (!ROLES.includes(role)) return { error: "Please choose a valid role." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: error.message };

  const uid = data.user?.id;
  if (uid) {
    const { error: pErr } = await supabase.from("profiles").insert({ id: uid, full_name, role });
    if (pErr) return { error: "Account created but profile setup failed. Contact support." };
  }
  redirect(ROLE_HOME[role]);
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
