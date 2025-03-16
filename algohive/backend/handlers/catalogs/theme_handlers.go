package catalogs

import (
	"api/database"
	"api/models"
	"encoding/json"
	"log"
	"net/http"
	"time"

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

    // Define a cache key specific to this catalog's themes
    cacheKey := "catalog_themes:" + catalogID
    ctx := c.Request.Context()

    // Try to get themes from Redis cache first
    cachedThemes, err := database.REDIS.Get(ctx, cacheKey).Result()
    if err == nil {
        // Cache hit - parse and return the cached themes
        var themes []ThemeResponse
        if err := json.Unmarshal([]byte(cachedThemes), &themes); err == nil {
            log.Printf("Returning themes for catalog %s from cache", catalogID)
            c.JSON(http.StatusOK, themes)
            return
        }
        // If unmarshaling fails, continue with fetching from API
        log.Printf("Error unmarshaling cached themes: %v", err)
    }

    // Cache miss or error - fetch from database and API
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

    // Cache the themes in Redis with 10 minute expiration
    themesJSON, err := json.Marshal(themes)
    if err == nil {
        err = database.REDIS.Set(ctx, cacheKey, themesJSON, 10*time.Minute).Err()
        if err != nil {
            log.Printf("Error caching themes in Redis: %v", err)
            // Continue even if caching fails
        } else {
            log.Printf("Themes for catalog %s cached successfully", catalogID)
        }
    }

    c.JSON(http.StatusOK, themes)
}