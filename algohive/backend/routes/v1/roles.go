package v1

import (
	"api/database"
	"api/middleware"
	"api/models"
	"api/utils/permissions"
	"net/http"

	"github.com/gin-gonic/gin"
)

// @Summary Create a new Role
// @Description Create a new Role
// @Tags Roles
// @Accept json
// @Produce json
// @Param role body models.Role true "Role Profile"
// @Success 200 {object} models.Role
// @Failure 400 {object} map[string]string
// @Router /roles [post]
// @Security Bearer
func CreateRole(c *gin.Context) {
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

	if !permissions.RolesHavePermission(user.Roles, permissions.ROLES) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User does not have permission to create roles"})
		return
	}

	var role models.Role
	if err := c.ShouldBindJSON(&role); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	database.DB.Create(&role)

	c.JSON(http.StatusOK, role)
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

	if !permissions.RolesHavePermission(user.Roles, permissions.ROLES) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User does not have permission to view all roles"})
		return
	}

	var roles []models.Role
	database.DB.Find(&roles)
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
	roleID := c.Param("role_id")

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

	if !permissions.RolesHavePermission(user.Roles, permissions.ROLES) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User does not have permission to update roles"})
		return
	}

	var role models.Role
	result = database.DB.Where("id = ?", roleID).First(&role)
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
	roleID := c.Param("role_id")

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

    if !permissions.RolesHavePermission(user.Roles, permissions.ROLES) {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User does not have permission to detach roles from users"})
        return
    }
	
	result = database.DB.Where("id = ?", userID).Preload("Roles").First(&user)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	
	var role models.Role
	result = database.DB.Where("id = ?", roleID).First(&role)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Role not found"})
		return
	}
	
	user.Roles = append(user.Roles, &role)
	database.DB.Save(&user)
	
	c.JSON(http.StatusOK, user)
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
	roleID := c.Param("role_id")

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

	if !permissions.RolesHavePermission(user.Roles, permissions.ROLES) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User does not have permission to detach roles from users"})
		return
	}
	
	result = database.DB.Where("id = ?", userID).Preload("Roles").First(&user)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	
	var role models.Role
	result = database.DB.Where("id = ?", roleID).First(&role)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Role not found"})
		return
	}
	
	for i, r := range user.Roles {
		if r.ID == role.ID {
			user.Roles = append(user.Roles[:i], user.Roles[i+1:]...)
			break
		}
	}
	
	database.DB.Save(&user)
	
	c.JSON(http.StatusOK, user)
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
    }
}