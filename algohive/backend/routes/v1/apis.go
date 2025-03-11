package v1

import (
	"api/database"
	"api/middleware"
	"api/models"
	"api/utils/permissions"
	"net/http"

	"github.com/gin-gonic/gin"
)

// @Summary Get all APIs Catalog
// @Description Get all APIs, only accessible to users with the API_ENV permission
// @Tags APIs
// @Accept json
// @Produce json
// @Success 200 {array} models.APIEnvironment
// @Failure 401 {object} map[string]string
// @Router /apis [get]
// @Security Bearer
func GetAllApis(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
        return
    }

	var user models.User
    result := database.DB.Where("id = ?", userID).Preload("Roles").First(&user)
    if result.Error != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
        return
    }

    if !permissions.RolesHavePermission(user.Roles, permissions.API_ENV) {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User does not have permission to view APIs"})
        return
    }

	var apis []models.APIEnvironment
	database.DB.Find(&apis)
	c.JSON(http.StatusOK, apis)
	return
};

func RegisterApis(r *gin.RouterGroup) {
	apis := r.Group("/apis")
	apis.Use(middleware.AuthMiddleware())
	{
		apis.GET("/", GetAllApis)
	}
}