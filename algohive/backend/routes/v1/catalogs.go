package v1

import (
	"api/database"
	"api/middleware"
	"api/models"
	"api/utils/permissions"
	"encoding/json"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

type PuzzleResponse struct {
    Author          string `json:"author"`
    Cipher          string `json:"cipher"`
    CompressedSize  int    `json:"compressedSize"`
    CreatedAt       string `json:"createdAt"`
    Difficulty      string `json:"difficulty"`
    ID              string `json:"id"`
    Language        string `json:"language"`
    Name            string `json:"name"`
    Obscure         string `json:"obscure"`
    UncompressedSize int   `json:"uncompressedSize"`
    UpdatedAt       string `json:"updatedAt"`
}

type ThemeResponse struct {
    EnigmesCount int             `json:"enigmes_count"`
    Name         string          `json:"name"`
    Puzzles      []PuzzleResponse `json:"puzzles"`
    Size         int             `json:"size"`
}

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
	
    if !permissions.RolesHavePermission(user.Roles, permissions.API_ENV) {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User does not have permission to view Catalogs"})
        return
    }

	var catalogs []models.Catalog
	database.DB.Preload("Scopes").Find(&catalogs)
    
    c.JSON(http.StatusOK, catalogs)
};

// @Summary Get all the themes from a single API from it's ID
// @Description Get all the themes from a single API from it's ID
// @Tags Catalogs
// @Accept json
// @Produce json
// @Param catalogID path string true "API ID"
// @Success 200 {array} ThemeResponse
// @Failure 401 {object} map[string]string
// @Router /catalogs/{catalogID}/themes [get]
// @Security Bearer
func GetThemesFromCatalog(c *gin.Context) {
	catalogID := c.Param("catalogID")
	log.Println(catalogID)

	var catalog models.Catalog
	result := database.DB.First(&catalog, "id = ?", catalogID)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "API not found"})
		return
	}

	// Reach the API at catalog.Address/themes
	resp, err := http.Get(catalog.Address + "/themes")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error while reaching the API"})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		c.JSON(resp.StatusCode, gin.H{"error": "Error while reaching the API"})
		return
	}

	var themes []ThemeResponse
	err = json.NewDecoder(resp.Body).Decode(&themes)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error while decoding the response"})
		return
	}

	c.JSON(http.StatusOK, themes)
}

func RegisterApisRoutes(r *gin.RouterGroup) {
	catalogs := r.Group("/catalogs")
	catalogs.Use(middleware.AuthMiddleware())
	{
		catalogs.GET("/", GetAllCatalogs)
		catalogs.GET("/:catalogId/themes", GetThemesFromCatalog)
	}
}