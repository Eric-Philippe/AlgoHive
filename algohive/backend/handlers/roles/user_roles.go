package roles

import (
	"api/database"
	"api/middleware"
	"api/models"
	"api/utils/permissions"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// AttachRoleToUser attache un rôle à un utilisateur
// @Summary Attach a Role to a User
// @Description Attach a Role to a User
// @Tags Roles
// @Accept json
// @Produce json
// @Param user_id path string true "User ID"
// @Param role_id path string true "Role ID"
// @Success 200 {object} models.User
// @Failure 404 {object} map[string]string
// @Router /roles/attach/{role_id}/to-user/{user_id} [post]
// @Security Bearer
func AttachRoleToUser(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	// Vérifier les permissions
    if !permissions.RolesHavePermission(user.Roles, permissions.ROLES) {
        respondWithError(c, http.StatusUnauthorized, ErrNoPermissionAttach)
        return
    }

	// Récupérer l'utilisateur cible
	targetUserId := c.Param("user_id")
	var targetUser models.User
	
	if err := database.DB.Where("id = ?", targetUserId).Preload("Roles").First(&targetUser).Error; err != nil {
		respondWithError(c, http.StatusNotFound, ErrUserNotFound)
		return
	}

	// Récupérer le rôle à attacher
	roleID := c.Param("role_id")
	
	var role models.Role
	if err := database.DB.Where("id = ?", roleID).First(&role).Error; err != nil {
		respondWithError(c, http.StatusNotFound, ErrRoleNotFound)
		return
	}
	
	// Attacher le rôle à l'utilisateur
	targetUser.Roles = append(targetUser.Roles, &role)
	if err := database.DB.Save(&targetUser).Error; err != nil {
		log.Printf("Error attaching role to user: %v", err)
		respondWithError(c, http.StatusInternalServerError, "Failed to attach role to user")
		return
	}
	
	c.JSON(http.StatusOK, targetUser)
}

// DetachRoleFromUser détache un rôle d'un utilisateur
// @Summary Detach a Role from a User
// @Description Detach a Role from a User
// @Tags Roles
// @Accept json
// @Produce json
// @Param user_id path string true "User ID"
// @Param role_id path string true "Role ID"
// @Success 200 {object} models.User
// @Failure 404 {object} map[string]string
// @Router /roles/detach/{role_id}/from-user/{user_id} [delete]
// @Security Bearer
func DetachRoleFromUser(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	// Vérifier les permissions
	if !permissions.RolesHavePermission(user.Roles, permissions.ROLES) {
		respondWithError(c, http.StatusUnauthorized, ErrNoPermissionDetach)
		return
	}

	// Récupérer l'utilisateur cible
	targetUserId := c.Param("user_id")
	var targetUser models.User
	
	if err := database.DB.Where("id = ?", targetUserId).Preload("Roles").First(&targetUser).Error; err != nil {
		respondWithError(c, http.StatusNotFound, ErrUserNotFound)
		return
	}
	
	// Récupérer le rôle à détacher
	roleID := c.Param("role_id")

	var role models.Role
	if err := database.DB.Where("id = ?", roleID).First(&role).Error; err != nil {
		respondWithError(c, http.StatusNotFound, ErrRoleNotFound)
		return
	}
	
	// Rechercher et retirer le rôle de l'utilisateur
	for i, r := range targetUser.Roles {
		if r.ID == role.ID {
			targetUser.Roles = append(targetUser.Roles[:i], targetUser.Roles[i+1:]...)
			break
		}
	}
	
	if err := database.DB.Save(&targetUser).Error; err != nil {
		log.Printf("Error detaching role from user: %v", err)
		respondWithError(c, http.StatusInternalServerError, "Failed to detach role from user")
		return
	}
	
	c.JSON(http.StatusOK, targetUser)
}
