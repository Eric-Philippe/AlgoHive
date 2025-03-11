package v1

import (
	"api/database"
	"api/middleware"
	"api/models"
	"api/utils/permissions"
	"net/http"

	"github.com/gin-gonic/gin"
)

// CreateScopeRequest model for creating a scope
type CreateScopeRequest struct {
    Name string `json:"name" binding:"required"`
    ApiIds []string `json:"api_ids" binding:"required"`
}

// @Summary Get all scopes
// @Description Get all scopes, only accessible to users with the SCOPES permission
// @Tags Scopes
// @Accept json
// @Produce json
// @Success 200 {array} models.Scope
// @Failure 401 {object} map[string]string
// @Router /scopes [get]
// @Security Bearer
func GetAllScopes(c *gin.Context) {
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

    if !permissions.RolesHavePermission(user.Roles, permissions.SCOPES) {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User does not have permission to view scopes"})
        return
    }

    var scopes []models.Scope
        database.DB.Find(&scopes)
        c.JSON(http.StatusOK, scopes)
        return
}

// @Summary Get a scope
// @Description Get a scope, only accessible to users with the SCOPES permission
// @Tags Scopes
// @Accept json
// @Produce json
// @Param id path string true "Scope ID"
// @Success 200 {object} models.Scope
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /scopes/{id} [get]
// @Security Bearer
func GetScope(c *gin.Context) {
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

    if !permissions.RolesHavePermission(user.Roles, permissions.SCOPES) {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User does not have permission to view scopes"})
        return
    }

    scopeID := c.Param("id")
    var scope models.Scope
    result = database.DB.Where("id = ?", scopeID).Preload("APIEnvironments").Preload("Roles").First(&scope)
    if result.Error != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Scope not found"})
        return
    }

    c.JSON(http.StatusOK, scope)
    return
}

// @Summary Create a scope
// @Description Create a scope, only accessible to users with the SCOPES permission
// @Tags Scopes
// @Accept json
// @Produce json
// @Param createScope body CreateScopeRequest true "Scope Details"
// @Success 201 {object} models.Scope
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /scopes [post]
// @Security Bearer
func CreateScope(c *gin.Context) {
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

    if !permissions.RolesHavePermission(user.Roles, permissions.SCOPES) {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User does not have permission to create scopes"})
        return
    }
    
    var createScopeReq CreateScopeRequest
    if err := c.ShouldBindJSON(&createScopeReq); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    var apiEnv[]*models.APIEnvironment
    database.DB.Where("id IN (?)", createScopeReq.ApiIds).Find(&apiEnv)

    if len(apiEnv) != len(createScopeReq.ApiIds) {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid API environment IDs"})
        return
    }

    scope := models.Scope{
        Name: createScopeReq.Name,
    }

    if err := database.DB.Create(&scope).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create scope: " + err.Error()})
        return
    }

    if len(apiEnv) > 0 {
        if err := database.DB.Model(&scope).Association("APIEnvironments").Append(apiEnv); err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to associate API environments: " + err.Error()})
            return
        }
    }

    c.JSON(http.StatusCreated, scope)
    return
}

// @Summary Delete a scope
// @Description Delete a scope, only accessible to users with the SCOPES permission
// @Tags Scopes
// @Accept json
// @Produce json
// @Param id path string true "Scope ID"
// @Success 204 {object} string
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /scopes/{id} [delete]
// @Security Bearer
func DeleteScope(c *gin.Context) {
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

    if !permissions.RolesHavePermission(user.Roles, permissions.SCOPES) {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User does not have permission to delete scopes"})
        return
    }

    scopeID := c.Param("id")
    var scope models.Scope
    result = database.DB.Where("id = ?", scopeID).First(&scope)
    if result.Error != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Scope not found"})
        return
    }

    // Clear associations before deleting the scope
    if err := database.DB.Model(&scope).Association("APIEnvironments").Clear(); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear scope associations: " + err.Error()})
        return
    }

    if err := database.DB.Delete(&scope).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete scope: " + err.Error()})
        return
    }

    c.JSON(http.StatusNoContent, nil)
    return
}

// @Summary Update a scope
// @Description Update a scope, only accessible to users with the SCOPES permission
// @Tags Scopes
// @Accept json
// @Produce json
// @Param id path string true "Scope ID"
// @Param updateScope body CreateScopeRequest true "Scope Details"
// @Success 200 {object} models.Scope
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /scopes/{id} [put]
// @Security Bearer
func UpdateScope(c *gin.Context) {
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

    if !permissions.RolesHavePermission(user.Roles, permissions.SCOPES) {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User does not have permission to update scopes"})
        return
    }

    scopeID := c.Param("id")
    var scope models.Scope
    result = database.DB.Where("id = ?", scopeID).First(&scope)
    if result.Error != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Scope not found"})
        return
    }

    var updateScopeReq CreateScopeRequest
    if err := c.ShouldBindJSON(&updateScopeReq); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    var apiEnv[]*models.APIEnvironment
    database.DB.Where("id IN (?)", updateScopeReq.ApiIds).Find(&apiEnv)

    if len(apiEnv) != len(updateScopeReq.ApiIds) {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid API environment IDs"})
        return
    }

    scope.Name = updateScopeReq.Name

    if err := database.DB.Save(&scope).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update scope: " + err.Error()})
        return
    }

    if err := database.DB.Model(&scope).Association("APIEnvironments").Replace(apiEnv); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update scope associations: " + err.Error()})
        return
    }

    c.JSON(http.StatusOK, scope)
    return
}

func RegisterScopes(r *gin.RouterGroup) {
    scopes := r.Group("/scopes")
    scopes.Use(middleware.AuthMiddleware())
    {
        scopes.POST("/", CreateScope)
        scopes.GET("/", GetAllScopes)
        scopes.GET("/:id", GetScope)
        scopes.PUT("/:id", UpdateScope)
        scopes.DELETE("/:id", DeleteScope)
    }
}