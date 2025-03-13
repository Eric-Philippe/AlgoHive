package v1

import (
	"api/database"
	"api/middleware"
	"api/models"
	"api/utils/permissions"
	"net/http"

	"github.com/gin-gonic/gin"
)

type CreateRoleRequest struct {
	Name string        `json:"name" binding:"required"`
	Permission int   `json:"permission"`
	ScopesIds []string `json:"scopes_ids"`
}

// @Summary Create a new Role
// @Description Create a new Role
// @Tags Roles
// @Accept json
// @Produce json
// @Param role body CreateRoleRequest true "Role Profile"
// @Success 200 {object} models.Role
// @Failure 400 {object} map[string]string
// @Router /roles [post]
// @Security Bearer
func CreateRole(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	if !permissions.RolesHavePermission(user.Roles, permissions.ROLES) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User does not have permission to create roles"})
		return
	}

	var createRoleRequest CreateRoleRequest
	if err := c.ShouldBindJSON(&createRoleRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// If there is no scope
	var scopePointers []*models.Scope
	if len(createRoleRequest.ScopesIds) > 0 {
		var scopes []models.Scope
		database.DB.Where("id IN (?)", createRoleRequest.ScopesIds).Find(&scopes)
		
		for i := range scopes {
			scopePointers = append(scopePointers, &scopes[i])
		}
	}


	role := models.Role{
		Name: createRoleRequest.Name,
		Permissions: createRoleRequest.Permission,
		Scopes: scopePointers,
	}

	database.DB.Create(&role)

	c.JSON(http.StatusCreated, role)
}

// @Summary Get all Roles
// @Description Get all Roles
// @Tags Roles
// @Accept json
// @Produce json
// @Success 200 {array} models.Role
// @Router /roles [get]
// @Security Bearer
func GetAllRoles(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	if !permissions.RolesHavePermission(user.Roles, permissions.ROLES) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User does not have permission to view all roles"})
		return
	}

	var roles []models.Role
	database.DB.Preload("Users").Preload("Scopes").Find(&roles)
	c.JSON(http.StatusOK, roles)
}

// @Summary Get a Role by ID
// @Description Get a Role by ID
// @Tags Roles
// @Accept json
// @Produce json
// @Param role_id path string true "Role ID"
// @Success 200 {object} models.Role
// @Failure 404 {object} map[string]string
// @Router /roles/{role_id} [get]
// @Security Bearer
func GetRoleByID(c *gin.Context) {
	roleID := c.Param("role_id")

	var role models.Role
	result := database.DB.Where("id = ?", roleID).First(&role)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Role not found"})
		return
	}

	c.JSON(http.StatusOK, role)
}

// @Summary Update a Role by ID
// @Description Update a Role by ID
// @Tags Roles
// @Accept json
// @Produce json
// @Param role_id path string true "Role ID"
// @Param role body models.Role true "Role Profile"
// @Success 200 {object} models.Role
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /roles/{role_id} [put]
// @Security Bearer
func UpdateRoleByID(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	if !permissions.RolesHavePermission(user.Roles, permissions.ROLES) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User does not have permission to update roles"})
		return
	}

	roleID := c.Param("role_id")

	var role models.Role
	result := database.DB.Where("id = ?", roleID).First(&role)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Role not found"})
		return
	}

	if err := c.ShouldBindJSON(&role); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	database.DB.Save(&role)

	c.JSON(http.StatusOK, role)
}

// @Summary Attach a Role to a User
// @Description Attach a Role to a User
// @Tags Roles
// @Accept json
// @Produce json
// @Param user_id path string true "User ID"
// @Param role_id path string true "Role ID"
// @Success 200 {object} models.User
// @Failure 404 {object} map[string]string
// @Router /user/{user_id}/role/{role_id} [post]
// @Security Bearer
func AttachRoleToUser(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

    if !permissions.RolesHavePermission(user.Roles, permissions.ROLES) {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User does not have permission to detach roles from users"})
        return
    }

	targetUserId := c.Param("user_id")
	var targetUser models.User
	
	result := database.DB.Where("id = ?", targetUserId).Preload("Roles").First(&targetUser)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	roleID := c.Param("role_id")
	
	var role models.Role
	result = database.DB.Where("id = ?", roleID).First(&role)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Role not found"})
		return
	}
	
	targetUser.Roles = append(targetUser.Roles, &role)
	database.DB.Save(&targetUser)
	
	c.JSON(http.StatusOK, targetUser)
}

// @Summary Detach a Role from a User
// @Description Detach a Role from a User
// @Tags Roles
// @Accept json
// @Produce json
// @Param user_id path string true "User ID"
// @Param role_id path string true "Role ID"
// @Success 200 {object} models.User
// @Failure 404 {object} map[string]string
// @Router /user/{user_id}/role/{role_id} [delete]
// @Security Bearer
func DetachRoleFromUser(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	if !permissions.RolesHavePermission(user.Roles, permissions.ROLES) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User does not have permission to detach roles from users"})
		return
	}

	targetUserId := c.Param("user_id")
	var targetUser models.User
	
	result := database.DB.Where("id = ?", targetUserId).Preload("Roles").First(&targetUser)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	
	roleID := c.Param("role_id")

	var role models.Role
	result = database.DB.Where("id = ?", roleID).First(&role)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Role not found"})
		return
	}
	
	for i, r := range targetUser.Roles {
		if r.ID == role.ID {
			targetUser.Roles = append(targetUser.Roles[:i], targetUser.Roles[i+1:]...)
			break
		}
	}
	
	database.DB.Save(&targetUser)
	
	c.JSON(http.StatusOK, targetUser)
}

// @Summary delete a role
// @Description delete a role and cascade first to roles_scopes and user_roles
// @Tags Roles
// @Accept json
// @Produce json
// @Param role_id path string true "Role ID"
// @Success 200 {object} models.Role
// @Failure 404 {object} map[string]string
// @Router /roles/{role_id} [delete]
// @Security Bearer
func DeleteRole(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

    if !permissions.RolesHavePermission(user.Roles, permissions.ROLES) {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User does not have permission to delete roles"})
        return
    }

	roleID := c.Param("role_id")

    var role models.Role
    result := database.DB.Where("id = ?", roleID).First(&role)
    if result.Error != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Role not found"})
        return
    }

    // Begin a transaction to ensure all operations succeed or fail together
    tx := database.DB.Begin()

    // Remove the role from all users who have it (clear user_roles associations)
    if err := tx.Exec("DELETE FROM user_roles WHERE role_id = ?", roleID).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove role associations from users"})
        return
    }

    // Remove all scope associations (clear role_scopes associations)
    if err := tx.Exec("DELETE FROM role_scopes WHERE role_id = ?", roleID).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove role associations from scopes"})
        return
    }

    // Now delete the role itself
    if err := tx.Delete(&role).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete role"})
        return
    }

    // Commit the transaction
    if err := tx.Commit().Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
        return
    }

    c.JSON(http.StatusOK, role)
}

// Register the endpoints for the v1 API
func RegisterRolesRoutes(r *gin.RouterGroup) {    
    user := r.Group("/roles")
    user.Use(middleware.AuthMiddleware())
    {
		user.POST("/", CreateRole)
		user.GET("/", GetAllRoles)
		user.GET("/:role_id", GetRoleByID)
		user.PUT("/:role_id", UpdateRoleByID)
		user.POST("/:role_id/user/:user_id", AttachRoleToUser)
		user.DELETE("/:role_id/user/:user_id", DetachRoleFromUser)
		user.DELETE("/:role_id", DeleteRole)
    }
}