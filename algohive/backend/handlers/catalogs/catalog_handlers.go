package catalogs

import (
	"api/database"
	"api/middleware"
	"api/models"
	"api/utils/permissions"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetAllCatalogs récupère tous les catalogues
// @Summary Get all Catalogs Catalog
// @Description Get all Catalogs, only accessible to users with the API_ENV permission
// @Tags Catalogs
// @Accept json
// @Produce json
// @Success 200 {array} models.Catalog
// @Failure 401 {object} map[string]string
// @Router /catalogs [get]
// @Security Bearer
func GetAllCatalogs(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}
	
	// Vérifier les permissions
	if !permissions.RolesHavePermission(user.Roles, permissions.API_ENV) {
		respondWithError(c, http.StatusUnauthorized, ErrNoPermissionView)
		return
	}

	var catalogs []models.Catalog
	if err := database.DB.Preload("Scopes").Find(&catalogs).Error; err != nil {
		log.Printf("Error getting all catalogs: %v", err)
		respondWithError(c, http.StatusInternalServerError, "Failed to fetch catalogs")
		return
	}
	
	c.JSON(http.StatusOK, catalogs)
}
