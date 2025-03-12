package v1

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

// CreateScopeRequest model for creating a scope
type CreateScopeRequest struct {
    Name string `json:"name" binding:"required"`
    Description string `json:"description"`
    ApiIds []string `json:"api_ids" binding:"required"`
}

// ScopeResponse model for returning a scope
type ScopeResponse struct {
    ID string `json:"id"`
    Name string `json:"name"`
    Description string `json:"description"`
    APIEnvironments []models.APIEnvironment `json:"catalogs"`
    Roles []models.Role `json:"roles"`
}

// @Summary Get all scopes
// @Description Get all scopes, only accessible to users with the SCOPES permission
// @Tags Scopes
// @Accept json
// @Produce json
// @Success 200 {array} ScopeResponse
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
        var scopeResponses []ScopeResponse
        for _, scope := range scopes {
            scopeResponses = append(scopeResponses, ScopeResponse{
                ID: scope.ID,
                Name: scope.Name,
                Description: scope.Description,
                APIEnvironments: utils.ConvertAPIEnvironments(scope.APIEnvironments),
                Roles: utils.ConvertRoles(scope.Roles),
            })
        }

        c.JSON(http.StatusOK, scopeResponses)
}

// @Summary Get all scopes that the user has access to
// @Description Get all scopes that the user has access to (based on roles) if the user has the SCOPES permission we return all scopes
// @Tags Scopes
// @Accept json
// @Produce json
// @Success 200 {array} ScopeResponse
// @Failure 401 {object} map[string]string
// @Router /scopes/user [get]
// @Security Bearer
func GetUserScopes(c *gin.Context) {
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

    var scopes []models.Scope
    if permissions.RolesHavePermission(user.Roles, permissions.SCOPES) {
        database.DB.Preload("APIEnvironments").Preload("Roles").Find(&scopes)
    } else {
        database.DB.Model(&user).Preload("Roles").Preload("Roles.Scopes").First(&user)
        for _, role := range user.Roles {
            for _, scope := range role.Scopes {
                if !utils.ContainsScope(scopes, scope.ID) {
                    scopes = append(scopes, *scope)
                }
            }
        }
    }

    var scopeResponses []ScopeResponse
    for _, scope := range scopes {
        scopeResponses = append(scopeResponses, ScopeResponse{
            ID: scope.ID,
            Name: scope.Name,
            Description: scope.Description,
            APIEnvironments: utils.ConvertAPIEnvironments(scope.APIEnvironments),
            Roles: utils.ConvertRoles(scope.Roles),
        })
    }

    c.JSON(http.StatusOK, scopeResponses)
}

// @Summary Get a scope
// @Description Get a scope, only accessible to users with the SCOPES permission
// @Tags Scopes
// @Accept json
// @Produce json
// @Param scope_id path string true "Scope ID"
// @Success 200 
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

    scopeID := c.Param("scope_id")
    var scope models.Scope
    result = database.DB.Where("id = ?", scopeID).Preload("APIEnvironments").Preload("Roles").First(&scope)
    if result.Error != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Scope not found"})
        return
    }

    // Parse the found scope into a response
    scopeResponse := ScopeResponse{
        ID: scope.ID,
        Name: scope.Name,
        Description: scope.Description,
        APIEnvironments: utils.ConvertAPIEnvironments(scope.APIEnvironments),
        Roles: utils.ConvertRoles(scope.Roles),
    }

    c.JSON(http.StatusOK, scopeResponse)
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

    log.Println(createScopeReq.ApiIds)
    var apiEnv[]*models.APIEnvironment
    database.DB.Where("id IN (?)", createScopeReq.ApiIds).Find(&apiEnv)

    if len(apiEnv) != len(createScopeReq.ApiIds) {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid API environment IDs"})
        return
    }

    scope := models.Scope{
        Name: createScopeReq.Name,
        Description: createScopeReq.Description,
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
}

// @Summary Delete a scope
// @Description Delete a scope, only accessible to users with the SCOPES permission
// @Tags Scopes
// @Accept json
// @Produce json
// @Param scope_id path string true "Scope ID"
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

    scopeID := c.Param("scope_id")
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
}

// @Summary Update a scope
// @Description Update a scope, only accessible to users with the SCOPES permission
// @Tags Scopes
// @Accept json
// @Produce json
// @Param scope_id path string true "Scope ID"
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

    scopeID := c.Param("scope_id")
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
}

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
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User does not have permission to attach scopes to roles"})
        return
    }

    scopeID := c.Param("scope_id")
    var scope models.Scope
    result = database.DB.Where("id = ?", scopeID).First(&scope)
    if result.Error != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Scope not found"})
        return
    }

    roleID := c.Param("role_id")
    var role models.Role
    result = database.DB.Where("id = ?", roleID).First(&role)
    if result.Error != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Role not found"})
        return
    }

    if err := database.DB.Model(&scope).Association("Roles").Append(&role); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to attach scope to role: " + err.Error()})
        return
    }

    c.JSON(http.StatusOK, scope)
}

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
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User does not have permission to detach scopes from roles"})
        return
    }

    scopeID := c.Param("scope_id")
    var scope models.Scope
    result = database.DB.Where("id = ?", scopeID).First(&scope)
    if result.Error != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Scope not found"})
        return
    }

    roleID := c.Param("role_id")
    var role models.Role
    result = database.DB.Where("id = ?", roleID).First(&role)
    if result.Error != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Role not found"})
        return
    }

    if err := database.DB.Model(&scope).Association("Roles").Delete(&role); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to detach scope from role: " + err.Error()})
        return
    }

    c.JSON(http.StatusOK, scope)
}

// RegisterScopes registers the scope routes
func RegisterScopesRoutes(r *gin.RouterGroup) {
    scopes := r.Group("/scopes")
    scopes.Use(middleware.AuthMiddleware())
    {
        scopes.POST("/", CreateScope)
        scopes.GET("/", GetAllScopes)
        scopes.GET("/user", GetUserScopes)
        scopes.GET("/:scope_id", GetScope)
        scopes.PUT("/:scope_id", UpdateScope)
        scopes.POST("/:scope_id/roles/:role_id", AttachScopeToRole)
        scopes.DELETE("/:scope_id/roles/:role_id", DetachScopeFromRole)
        scopes.DELETE("/:scope_id", DeleteScope)
    }
}