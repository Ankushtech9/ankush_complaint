export function homeForRole(role) {
  if (role === "admin") return "/admin";
  if (role === "official") return "/official";
  return "/dashboard";
}
