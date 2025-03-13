package v1

import (
	"api/database"
	"api/middleware"
	"api/models"
	"api/utils"
	"api/utils/permissions"
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// CreateScopeRequest model for creating a scope
type CreateScopeRequest struct {
    Name string `json:"name" binding:"required"`
    Description string `json:"description"`
    CatalogsIds []string `json:"catalogs_ids" binding:"required"`
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
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

    if !permissions.RolesHavePermission(user.Roles, permissions.SCOPES) {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User does not have permission to view scopes"})
        return
    }

    var scopes []models.Scope
    database.DB.Find(&scopes)
       
    c.JSON(http.StatusOK, scopes)
}

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
    if permissions.RolesHavePermission(user.Roles, permissions.SCOPES) {
        database.DB.Preload("Catalogs").Preload("Roles").Find(&scopes)
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

    c.JSON(http.StatusOK, scopes)
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
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

    if !permissions.RolesHavePermission(user.Roles, permissions.SCOPES) {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User does not have permission to view scopes"})
        return
    }

    scopeID := c.Param("scope_id")
    var scope models.Scope
    result := database.DB.Where("id = ?", scopeID).Preload("Catalogs").Preload("Roles").First(&scope)
    if result.Error != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Scope not found"})
        return
    }

    c.JSON(http.StatusOK, scope)
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
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
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

    var catalogs[]*models.Catalog
    database.DB.Where("id IN (?)", createScopeReq.CatalogsIds).Find(&catalogs)

    if len(catalogs) != len(createScopeReq.CatalogsIds) {
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

    if len(catalogs) > 0 {
        if err := database.DB.Model(&scope).Association("Catalogs").Append(catalogs); err != nil {
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
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

    if !permissions.RolesHavePermission(user.Roles, permissions.SCOPES) {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User does not have permission to delete scopes"})
        return
    }

    scopeID := c.Param("scope_id")
    var scope models.Scope
    result := database.DB.Where("id = ?", scopeID).First(&scope)
    if result.Error != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Scope not found"})
        return
    }

    // Clear associations before deleting the scope
    if err := database.DB.Model(&scope).Association("Catalogs").Clear(); err != nil {
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
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}
    if !permissions.RolesHavePermission(user.Roles, permissions.SCOPES) {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User does not have permission to update scopes"})
        return
    }

    scopeID := c.Param("scope_id")
    var scope models.Scope
    result := database.DB.Where("id = ?", scopeID).First(&scope)
    if result.Error != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Scope not found"})
        return
    }

    var updateScopeReq CreateScopeRequest
    if err := c.ShouldBindJSON(&updateScopeReq); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    var catalogs[]*models.Catalog
    database.DB.Where("id IN (?)", updateScopeReq.CatalogsIds).Find(&catalogs)

    if len(catalogs) != len(updateScopeReq.CatalogsIds) {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid API environment IDs"})
        return
    }

    scope.Name = updateScopeReq.Name

    if err := database.DB.Save(&scope).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update scope: " + err.Error()})
        return
    }

    if err := database.DB.Model(&scope).Association("Catalogs").Replace(catalogs); err != nil {
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
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

    if !permissions.RolesHavePermission(user.Roles, permissions.SCOPES) {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User does not have permission to attach scopes to roles"})
        return
    }

    scopeID := c.Param("scope_id")
    var scope models.Scope
    result := database.DB.Where("id = ?", scopeID).First(&scope)
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
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

    if !permissions.RolesHavePermission(user.Roles, permissions.SCOPES) {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User does not have permission to detach scopes from roles"})
        return
    }

    scopeID := c.Param("scope_id")
    var scope models.Scope
    result := database.DB.Where("id = ?", scopeID).First(&scope)
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
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User does not have permission to get users from roles"})
		return
	}

    // Get role IDs from query parameters
    rolesParam := c.QueryArray("roles")
    
    // If we received a single string with comma-separated values, split it
    var roles []string
    if len(rolesParam) == 1 && strings.Contains(rolesParam[0], ",") {
        roles = strings.Split(rolesParam[0], ",")
    } else {
        roles = rolesParam
    }

    if len(roles) == 0 {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Roles are required"})
        return
    }

	var scopesIDs []string
	err = database.DB.Raw(`
        SELECT DISTINCT s.id
            FROM scopes s
            JOIN role_scopes rs ON s.id = rs.scope_id
            JOIN roles r ON rs.role_id = r.id
			WHERE r.id IN ?
	`, roles).Pluck("id", &scopesIDs).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get scopes"})
		return
	}

	var scopes []models.Scope
	if len(scopesIDs) > 0 {
		err = database.DB.Preload("Groups").Where("id IN ?", scopesIDs).Find(&scopes).Error
		if err != nil {
            log.Println(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get scopes"})
			return
		}
	}

	c.JSON(http.StatusOK, scopes)
}

// RegisterScopes registers the scope routes
func RegisterScopesRoutes(r *gin.RouterGroup) {
    scopes := r.Group("/scopes")
    scopes.Use(middleware.AuthMiddleware())
    {
        scopes.POST("/", CreateScope)
        scopes.GET("/", GetAllScopes)
        scopes.GET("/user", GetUserScopes)
        scopes.GET("/roles", GetRoleScopes)
        scopes.GET("/:scope_id", GetScope)
        scopes.PUT("/:scope_id", UpdateScope)
        scopes.POST("/:scope_id/roles/:role_id", AttachScopeToRole)
        scopes.DELETE("/:scope_id/roles/:role_id", DetachScopeFromRole)
        scopes.DELETE("/:scope_id", DeleteScope)
    }
}