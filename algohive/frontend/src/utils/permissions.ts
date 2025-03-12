import { Role } from "../models/Role";

// Permissions allow a specific role to override the default permissions
export enum Permission {
  SCOPES = 1 << 0, // 00001
  API_ENV = 1 << 1, // 00010
  GROUPS = 1 << 2, // 00100
  COMPETITIONS = 1 << 3, // 01000
  ROLES = 1 << 4, // 10000
}

// Function to check if a role has a permission
export function hasPermission(
  rolePermissions: number,
  permission: number
): boolean {
  return (rolePermissions & permission) === permission;
}

export function rolesHavePermission(
  rolePermissions: Role[],
  permission: number
): boolean {
  return rolePermissions.some((rolePermission) =>
    hasPermission(rolePermission.permissions, permission)
  );
}
