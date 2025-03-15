package catalogs

import (
	"api/database"
	"api/models"
	"encoding/json"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetThemesFromCatalog récupère tous les thèmes d'un catalogue
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
	log.Println("Fetching themes for catalog:", catalogID)

	var catalog models.Catalog
	if err := database.DB.First(&catalog, "id = ?", catalogID).Error; err != nil {
		log.Printf("Error finding catalog: %v", err)
		respondWithError(c, http.StatusNotFound, ErrCatalogNotFound)
		return
	}

	// Contacter l'API à l'adresse catalog.Address/themes
	apiURL := catalog.Address + "/themes"
	log.Printf("Connecting to API at: %s", apiURL)
	
	resp, err := http.Get(apiURL)
	if err != nil {
		log.Printf("Error connecting to API: %v", err)
		respondWithError(c, http.StatusInternalServerError, ErrAPIReachFailed)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("API returned non-200 status: %d", resp.StatusCode)
		respondWithError(c, resp.StatusCode, ErrAPIReachFailed)
		return
	}

	var themes []ThemeResponse
	if err := json.NewDecoder(resp.Body).Decode(&themes); err != nil {
		log.Printf("Error decoding API response: %v", err)
		respondWithError(c, http.StatusInternalServerError, ErrDecodeResponseFailed)
		return
	}

	c.JSON(http.StatusOK, themes)
}
