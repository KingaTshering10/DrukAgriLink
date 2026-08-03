export type Role = "farmer" | "buyer" | "coordinator" | "transport";
export const ROLES: Role[] = ["farmer", "buyer", "coordinator", "transport"];

export const ROLE_HOME: Record<Role, string> = {
  farmer: "/farmer/dashboard",
  buyer: "/buyer/dashboard",
  coordinator: "/coordinator/dashboard",
  transport: "/transport/dashboard",
};

export function canAccess(role: Role | null | undefined, area: Role): boolean {
  return role === area;
}
