import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];

export const DEFAULT_ROLE: AppRole = "learner";

export const isAppRole = (value: unknown): value is AppRole => {
  return (
    value === "admin" ||
    value === "learner" ||
    value === "coach" ||
    value === "creator" ||
    value === "therapist"
  );
};

export const normalizeRole = (value: unknown): AppRole => {
  return isAppRole(value) ? value : DEFAULT_ROLE;
};

export const getPrimaryRole = (
  roles?: unknown,
  profileRole?: unknown
): AppRole => {
  const ordered: AppRole[] = [
    "admin",
    "therapist",
    "coach",
    "creator",
    "learner",
  ];

  const safeRoles = Array.isArray(roles) ? roles : [];
  const roleSet = new Set<AppRole>();

  for (const role of safeRoles) {
    if (isAppRole(role)) {
      roleSet.add(role);
    }
  }

  if (isAppRole(profileRole)) {
    roleSet.add(profileRole);
  }

  for (const role of ordered) {
    if (roleSet.has(role)) {
      return role;
    }
  }

  return DEFAULT_ROLE;
};

export const buildRoleList = (
  roles?: unknown,
  profileRole?: unknown
): AppRole[] => {
  const ordered: AppRole[] = [
    "admin",
    "therapist",
    "coach",
    "creator",
    "learner",
  ];

  const safeRoles = Array.isArray(roles) ? roles : [];
  const roleSet = new Set<AppRole>();

  for (const role of safeRoles) {
    if (isAppRole(role)) {
      roleSet.add(role);
    }
  }

  if (isAppRole(profileRole)) {
    roleSet.add(profileRole);
  }

  return ordered.filter((role) => roleSet.has(role));
};

export const roleToDashboardPath = (role?: unknown): string => {
  const normalized = normalizeRole(role);

  switch (normalized) {
    case "admin":
      return "/admin/dashboard";
    case "coach":
      return "/coach/dashboard";
    case "therapist":
      return "/therapist/dashboard";
    case "creator":
      return "/creator/dashboard";
    case "learner":
    default:
      return "/dashboard";
  }
};