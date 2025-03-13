import { Role } from "../models/Role";

// Permissions allow a specific role to override the default permissions
export enum Permission {
  SCOPES = 1 << 0, // 000001
  API_ENV = 1 << 1, // 000010
  GROUPS = 1 << 2, // 000100
  COMPETITIONS = 1 << 3, // 001000
  ROLES = 1 << 4, // 010000
  OWNER = 1 << 5, // 100000
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
