package utils

// Permissions allow a specific role to override the default permissions
const (
    SCOPES   = 1 << iota // 0001
    API_ENV              // 0010
    GROUPS               // 0100
    COMPETITIONS         // 1000
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
	return SCOPES | API_ENV | GROUPS | COMPETITIONS
}