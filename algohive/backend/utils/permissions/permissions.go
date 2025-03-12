package permissions

import "api/models"

// Permissions allow a specific role to override the default permissions
const (
    SCOPES   = 1 << iota // 00001
    API_ENV              // 00010
    GROUPS               // 00100
    COMPETITIONS         // 01000
    ROLES               //  10000
)

// Function to check if a role has a permission
func HasPermission(rolePermissions, permission int) bool {
    return (rolePermissions & permission) == permission
}

// Function to add a permission
func AddPermission(rolePermissions, permission int) int {
    return rolePermissions | permission
}

// Function to remove a permission
func RemovePermission(rolePermissions, permission int) int {
    return rolePermissions &^ permission
}

// Function to get the default permissions for an admin
func GetAdminPermissions() int {
	return SCOPES | API_ENV | GROUPS | COMPETITIONS | ROLES
}

func RolesHavePermission(roles []*models.Role, permission int) bool {
    for _, role := range roles {
        if HasPermission(role.Permissions, permission) {
            return true
        }
    }
    return false
}

// Function to merge the permissions of multiple roles
func MergeRolePermissions(roles []*models.Role) int {
    permissions := 0
    for _, role := range roles {
        permissions = AddPermission(permissions, role.Permissions)
    }
    return permissions
}