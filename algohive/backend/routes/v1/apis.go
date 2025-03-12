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

type APIEnvironmentResponse struct {
	ID          string   `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Address     string `json:"address"`
	Scopes	    []*models.Scope `json:"scopes"`
}

// @Summary Get all APIs Catalog
// @Description Get all APIs, only accessible to users with the API_ENV permission
// @Tags APIs
// @Accept json
// @Produce json
// @Success 200 {array} APIEnvironmentResponse
// @Failure 401 {object} map[string]string
// @Router /apis [get]
// @Security Bearer
func GetAllApis(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
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
	database.DB.Preload("Scopes").Find(&apis)

	    response := make([]APIEnvironmentResponse, len(apis))
    for i, api := range apis {
        response[i] = APIEnvironmentResponse{
            ID:          api.ID,
            Name:        api.Name,
            Description: api.Description,
            Address:     api.Address,
            Scopes:      api.Scopes,
        }
    }
    
    c.JSON(http.StatusOK, response)
};

// @Summary Get all the themes from a single API from it's ID
// @Description Get all the themes from a single API from it's ID
// @Tags APIs
// @Accept json
// @Produce json
// @Param apiID path string true "API ID"
// @Success 200 {array} ThemeResponse
// @Failure 401 {object} map[string]string
// @Router /apis/{apiID}/themes [get]
// @Security Bearer
func GetThemesFromAPI(c *gin.Context) {
	apiID := c.Param("apiID")
	log.Println(apiID)

	var api models.APIEnvironment
	result := database.DB.First(&api, "id = ?", apiID)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "API not found"})
		return
	}

	// Reach the API at api.Address/themes
	resp, err := http.Get(api.Address + "/themes")
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
	apis := r.Group("/apis")
	apis.Use(middleware.AuthMiddleware())
	{
		apis.GET("/", GetAllApis)
		apis.GET("/:apiID/themes", GetThemesFromAPI)
	}
}