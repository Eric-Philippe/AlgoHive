package scopes

import (
	"api/database"
	"api/middleware"
	"api/models"
	"api/utils/permissions"
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// AttachScopeToRole attache un scope à un rôle
// @Summary Attach the scope to a role
// @Description Attach the scope to a role, only accessible to users with the SCOPES permission
// @Tags Scopes
// @Accept json
// @Produce json
// @Param scope_id path string true "Scope ID"
// @Param role_id path string true "Role ID"
// @Success 200 {object} models.Scope
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /scopes/{scope_id}/roles/{role_id} [post]
// @Security Bearer
func AttachScopeToRole(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	if !permissions.RolesHavePermission(user.Roles, permissions.SCOPES) {
		respondWithError(c, http.StatusUnauthorized, ErrNoPermissionAttach)
		return
	}

	scopeID := c.Param("scope_id")
	var scope models.Scope
	if err := database.DB.Where("id = ?", scopeID).First(&scope).Error; err != nil {
		respondWithError(c, http.StatusNotFound, ErrScopeNotFound)
		return
	}

	roleID := c.Param("role_id")
	var role models.Role
	if err := database.DB.Where("id = ?", roleID).First(&role).Error; err != nil {
		respondWithError(c, http.StatusNotFound, ErrRoleNotFound)
		return
	}

	if err := database.DB.Model(&scope).Association("Roles").Append(&role); err != nil {
		log.Printf("Error attaching scope to role: %v", err)
		respondWithError(c, http.StatusInternalServerError, ErrFailedAttachRole+err.Error())
		return
	}

	c.JSON(http.StatusOK, scope)
}

// DetachScopeFromRole détache un scope d'un rôle
// @Summary Detach the scope from a role
// @Description Detach the scope from a role, only accessible to users with the SCOPES permission
// @Tags Scopes
// @Accept json
// @Produce json
// @Param scope_id path string true "Scope ID"
// @Param role_id path string true "Role ID"
// @Success 200 {object} models.Scope
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /scopes/{scope_id}/roles/{role_id} [delete]
// @Security Bearer
func DetachScopeFromRole(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	if !permissions.RolesHavePermission(user.Roles, permissions.SCOPES) {
		respondWithError(c, http.StatusUnauthorized, ErrNoPermissionDetach)
		return
	}

	scopeID := c.Param("scope_id")
	var scope models.Scope
	if err := database.DB.Where("id = ?", scopeID).First(&scope).Error; err != nil {
		respondWithError(c, http.StatusNotFound, ErrScopeNotFound)
		return
	}

	roleID := c.Param("role_id")
	var role models.Role
	if err := database.DB.Where("id = ?", roleID).First(&role).Error; err != nil {
		respondWithError(c, http.StatusNotFound, ErrRoleNotFound)
		return
	}

	if err := database.DB.Model(&scope).Association("Roles").Delete(&role); err != nil {
		log.Printf("Error detaching scope from role: %v", err)
		respondWithError(c, http.StatusInternalServerError, ErrFailedDetachRole+err.Error())
		return
	}

	c.JSON(http.StatusOK, scope)
}

// GetRoleScopes récupère tous les scopes auxquels un rôle a accès
// @Summary Get all the scopes that a role has access to
// @Description Get all the scopes that a role has access to, only accessible to users with the SCOPES permission
// @Tags Scopes
// @Accept json
// @Produce json
// @Param roles query []string true "Roles IDs"
// @Success 200 {array} models.Scope
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /scopes/roles [get]
// @Security Bearer
func GetRoleScopes(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	if !permissions.IsStaff(user) {
		respondWithError(c, http.StatusUnauthorized, ErrNoPermissionView)
		return
	}

	// Récupérer les IDs des rôles depuis les paramètres de requête
	rolesParam := c.QueryArray("roles")
	
	// Si on a reçu une seule chaîne avec des valeurs séparées par des virgules, la diviser
	var roles []string
	if len(rolesParam) == 1 && strings.Contains(rolesParam[0], ",") {
		roles = strings.Split(rolesParam[0], ",")
	} else {
		roles = rolesParam
	}

	if len(roles) == 0 {
		respondWithError(c, http.StatusBadRequest, ErrRolesRequired)
		return
	}

	// Charger les rôles pour vérifier les permissions
	var loadedRoles []*models.Role
	if err := database.DB.Where("id IN ?", roles).Find(&loadedRoles).Error; err != nil {
		log.Printf("Error loading roles: %v", err)
		respondWithError(c, http.StatusInternalServerError, "Failed to get roles")
		return
	}

	// Si les rôles ont la permission OWNER, retourner tous les scopes
	if permissions.RolesHavePermission(loadedRoles, permissions.OWNER) {
		var scopes []models.Scope
		if err := database.DB.Preload("Groups").Find(&scopes).Error; err != nil {
			log.Printf("Error getting all scopes: %v", err)
			respondWithError(c, http.StatusInternalServerError, ErrFailedGetScopes)
			return
		}

		c.JSON(http.StatusOK, scopes)
		return
	}

	// Sinon, récupérer seulement les scopes associés aux rôles spécifiés
	var scopesIDs []string
	if err := database.DB.Raw(`
		SELECT DISTINCT s.id
			FROM scopes s
			JOIN role_scopes rs ON s.id = rs.scope_id
			JOIN roles r ON rs.role_id = r.id
			WHERE r.id IN ?
	`, roles).Pluck("id", &scopesIDs).Error; err != nil {
		log.Printf("Error getting scope IDs: %v", err)
		respondWithError(c, http.StatusInternalServerError, ErrFailedGetScopes)
		return
	}

	var scopes []models.Scope
	if len(scopesIDs) > 0 {
		if err := database.DB.Preload("Groups").Where("id IN ?", scopesIDs).Find(&scopes).Error; err != nil {
			log.Printf("Error getting scopes by IDs: %v", err)
			respondWithError(c, http.StatusInternalServerError, ErrFailedGetScopes)
			return
		}
	}

	c.JSON(http.StatusOK, scopes)
}
