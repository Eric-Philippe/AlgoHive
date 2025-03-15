package users

import (
	"github.com/gin-gonic/gin"
)

// Constantes pour les messages d'erreur
const (
	ErrNotFound               = "User not found"
	ErrGroupNotFound          = "Group not found"
	ErrRoleNotFound           = "Role not found"
	ErrUnauthorized           = "Unauthorized access"
	ErrFailedToHashPassword   = "Failed to hash password"
	ErrFailedToGetUsers       = "Failed to get users"
	ErrFailedToDeleteUser     = "Failed to delete user"
	ErrRolesRequired          = "Roles are required"
	ErrNoPermissionGroups     = "User does not have permission to create users with groups"
	ErrNoPermissionRoles      = "User does not have permission to create users with roles"
	ErrNoPermissionDelete     = "User does not have permission to delete this user"
	ErrNoPermissionBlock      = "User does not have permission to toggle block status"
	ErrNoPermissionUsersRoles = "User does not have permission to get users from roles"
	ErrFailedAssociationRoles = "Failed to remove user role associations"
	ErrFailedAssociationGroups = "Failed to remove user group associations"
)

// UserWithRoles représente un utilisateur avec ses rôles associés pour les requêtes API
type UserWithRoles struct {
	FirstName string   `json:"firstname"`
	LastName  string   `json:"lastname"`
	Email     string   `json:"email"`
	Roles     []string `json:"roles"`
}

// UserWithGroup représente un utilisateur avec ses groupes associés pour les requêtes API
type UserWithGroup struct {
	FirstName string   `json:"firstname"`
	LastName  string   `json:"lastname"`
	Email     string   `json:"email"`
	Group     []string `json:"groups"`
}

// respondWithError envoie une réponse d'erreur standardisée
func respondWithError(c *gin.Context, status int, message string) {
    c.JSON(status, gin.H{"error": message})
}
