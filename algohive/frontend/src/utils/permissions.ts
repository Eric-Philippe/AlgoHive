import { t } from "i18next";
import { Role } from "../models/Role";
import { User } from "../models/User";

// Permissions allow a specific role to override the default permissions
export enum Permission {
  SCOPES = 1, // 000001 - Scopes management
  API_ENV = 2, // 000010 - Catalogs management
  GROUPS = 4, // 000100 - GROUPS management
  COMPETITIONS = 8, // 001000 - COMPETITIONS management
  ROLES = 16, // 010000 - ROLES management
  OWNER = 32, // 111111 - Owner (all permissions)
}

export const permissionsList = [
  {
    name: "SCOPES",
    value: Permission.SCOPES,
    label: t("staffTabs.roles.permissionTypes.scopes"),
  },
  {
    name: "API_ENV",
    value: Permission.API_ENV,
    label: t("staffTabs.roles.permissionTypes.catalogs"),
  },
  {
    name: "GROUPS",
    value: Permission.GROUPS,
    label: t("staffTabs.roles.permissionTypes.groups"),
  },
  {
    name: "COMPETITIONS",
    value: Permission.COMPETITIONS,
    label: t("staffTabs.roles.permissionTypes.competitions"),
  },
  {
    name: "ROLES",
    value: Permission.ROLES,
    label: t("staffTabs.roles.permissionTypes.roles"),
  },
];

// Function that returns true if the user is an owner
export function isOwner(user: User | null): boolean {
  if (!user) return false;

  return (
    user.roles &&
    user.roles.some((role) => hasPermission(role.permissions, Permission.OWNER))
  );
}

export function roleIsOwner(role: Role): boolean {
  return hasPermission(role.permissions, Permission.OWNER);
}

// Function that returns true if the user is staff or owner
export function isStaff(user: User | null): boolean {
  if (!user) return false;
  return (
    (user.roles && user.roles.length > 0) ||
    ((!user.roles || user.roles.length === 0) &&
      (!user.groups || user.groups.length === 0))
  );
}

// Function to get a 0-based index of a permission
export function getPermissionArray(permission: number): number[] {
  const permissions = [];
  for (let i = 0; i < 32; i++) {
    if (permission & (1 << i)) {
      permissions.push(i);
    }
  }
  return permissions;
}

// Function to check if a role has a permission
export function hasPermission(
  rolePermissions: number | number[],
  permValue: number
): boolean {
  if (typeof rolePermissions === "number") {
    // Bitwise check if single numeric value
    return (rolePermissions & permValue) === permValue;
  } else if (Array.isArray(rolePermissions)) {
    // Check if permission exists in array
    return rolePermissions.includes(permValue);
  }
  return false;
}

export function rolesHavePermission(
  rolePermissions: Role[],
  permission: number
): boolean {
  return rolePermissions.some((rolePermission) =>
    hasPermission(rolePermission.permissions, permission)
  );
}
