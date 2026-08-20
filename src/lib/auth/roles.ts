export type Role = "farmer" | "buyer" | "coordinator" | "transport" | "admin";

// Roles a user can pick at signup — deliberately excludes "admin".
// Admins are set manually in the database, never self-selected.
export const ROLES: Role[] = ["farmer", "buyer", "coordinator", "transport"];

export const ROLE_HOME: Record<Role, string> = {
  farmer: "/farmer/dashboard",
  buyer: "/buyer/dashboard",
  coordinator: "/coordinator/dashboard",
  transport: "/transport/dashboard",
  admin: "/admin",
};

export function canAccess(role: Role | null | undefined, area: Role): boolean {
  return role === area;
}