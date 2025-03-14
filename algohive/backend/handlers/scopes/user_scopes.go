package scopes

import (
	"api/database"
	"api/middleware"
	"api/models"
	"api/utils"
	"api/utils/permissions"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetUserScopes récupère tous les scopes auxquels l'utilisateur a accès
// @Summary Get all scopes that the user has access to
// @Description Get all scopes that the user has access to (based on roles) if the user has the SCOPES permission we return all scopes
// @Tags Scopes
// @Accept json
// @Produce json
// @Success 200 {array} models.Scope
// @Failure 401 {object} map[string]string
// @Router /scopes/user [get]
// @Security Bearer
func GetUserScopes(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	var scopes []models.Scope
	
	// Si l'utilisateur a la permission SCOPES, retourner tous les scopes
	if permissions.RolesHavePermission(user.Roles, permissions.SCOPES) {
		if err := database.DB.Preload("Catalogs").Preload("Roles").Find(&scopes).Error; err != nil {
			log.Printf("Error getting all scopes: %v", err)
			respondWithError(c, http.StatusInternalServerError, ErrFailedGetScopes)
			return
		}
	} else {
		// Sinon, récupérer uniquement les scopes auxquels il a accès via ses rôles
		if err := database.DB.Model(&user).Preload("Roles").Preload("Roles.Scopes").First(&user).Error; err != nil {
			log.Printf("Error loading user with roles and scopes: %v", err)
			respondWithError(c, http.StatusInternalServerError, "Failed to load user data")
			return
		}
		
		for _, role := range user.Roles {
			for _, scope := range role.Scopes {
				if !utils.ContainsScope(scopes, scope.ID) {
					scopes = append(scopes, *scope)
				}
			}
		}
	}

	c.JSON(http.StatusOK, scopes)
}
