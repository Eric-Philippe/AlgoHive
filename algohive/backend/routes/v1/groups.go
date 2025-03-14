package v1

import (
	"api/database"
	"api/middleware"
	"api/models"
	"api/utils/permissions"
	"net/http"

	"github.com/gin-gonic/gin"
)

// CreateGroupRequest model for creating a group
type CreateGroupRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
	ScopeId		string `json:"scope_id" binding:"required"`
}

// UpdateGroupRequest model for updating a group
type UpdateGroupRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

// Function to check if at last one of user's role has a scope that is the specified models.group
func userCanManageGroup(userID string, group *models.Group) bool {
	// Get the cascade of user -> roles -> scopes -> groups from the database
	// Check if the group is in the cascade
	// Return true if it is, false otherwise
	var user models.User
	database.DB.Where("id = ?", userID).Preload("Roles.Scopes.Groups").First(&user)
	for _, role := range user.Roles {
		for _, scope := range role.Scopes {
			for _, g := range scope.Groups {
				if g.ID == group.ID {
					return true
				}
			}
		}
	}
	
	return false
}

// @Summary Get all groups
// @Description Get all groups, only accessible to users with the GROUPS permission
// @Tags Groups
// @Accept json
// @Produce json
// @Success 200 {array} models.Group
// @Failure 401 {object} map[string]string
// @Router /groups [get]
// @Security Bearer
func GetAllGroups(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	if !permissions.RolesHavePermission(user.Roles, permissions.GROUPS) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User does not have permission to view groups"})
		return
	}

	var groups []models.Group
	database.DB.Find(&groups)
	c.JSON(http.StatusOK, groups)
}

// @Summary Get a group
// @Description Get a group
// @Tags Groups
// @Accept json
// @Produce json
// @Param group_id path string true "Group ID"
// @Success 200 {object} models.Group
// @Failure 400 {object} map[string]string
// @Router /groups/{group_id} [get]
// @Security Bearer
func GetGroup(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	groupID := c.Param("group_id")
	var group models.Group
	result := database.DB.Where("id = ?", groupID).Preload("Users").Preload("Competitions").First(&group)
	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Group not found"})
		return
	}

	if !userCanManageGroup(user.ID, &group) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User does not have permission to view this group"})
		return
	}

	c.JSON(http.StatusOK, group)
}

// @Summary Create a group
// @Description Create a group, only accessible to users with the GROUPS permission
// @Tags Groups
// @Accept json
// @Produce json
// @Param group body CreateGroupRequest true "Group to create"
// @Success 201 {object} models.Group
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /groups [post]
// @Security Bearer
func CreateGroup(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	// TODO: Check if the user given scope is in its roles reach
	if !permissions.IsStaff(user) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User does not have permission to create groups"})
		return
	}

	var req CreateGroupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var scopes []models.Scope
	result := database.DB.Where("id = ?", req.ScopeId).Find(&scopes)
	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid scope IDs"})
		return
	}

	group := models.Group{
		Name:        req.Name,
		Description: req.Description,
		ScopeID:    req.ScopeId,
	}
	database.DB.Create(&group)
	database.DB.Model(&group).Association("Scopes").Append(scopes)
	c.JSON(http.StatusCreated, group)
}

// @Summary Delete a group and cascade delete all users and competitions associated with the group
// @Description Delete a group and cascade delete all users and competitions associated with the group
// @Tags Groups
// @Accept json
// @Produce json
// @Param group_id path string true "Group ID"
// @Success 204 {object} string
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /groups/{group_id} [delete]
// @Security Bearer
func DeleteGroup(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	groupID := c.Param("group_id")
	var group models.Group
	result := database.DB.Where("id = ?", groupID).Preload("Users").Preload("Competitions").First(&group)
	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Group not found"})
		return
	}

	if !userCanManageGroup(user.ID, &group) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User does not have permission to delete this group"})
		return
	}

	database.DB.Delete(&group)
	c.JSON(http.StatusNoContent, nil)
}

// @Summary Add a user to a group
// @Description Add a user to a group
// @Tags Groups
// @Accept json
// @Produce json
// @Param group_id path string true "Group ID"
// @Param user_id path string true "User ID"
// @Success 204 {object} string
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /groups/{group_id}/users/{user_id} [post]
// @Security Bearer
func AddUserToGroup(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	groupID := c.Param("group_id")
	if !UserOwnsGroup(user.ID, groupID) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User does not have permission to add users to this group"})
		return
	}

	var group models.Group
	result := database.DB.Where("id = ?", groupID).Preload("Users").First(&group)
	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Group not found"})
		return
	}

	if !userCanManageGroup(user.ID, &group) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User does not have permission to add users to this group"})
		return
	}

	targetUserID := c.Param("user_id")
	var targetUser models.User

	result = database.DB.Where("id = ?", targetUserID).First(&targetUser)
	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User not found"})
		return
	}

	database.DB.Model(&group).Association("Users").Append(&targetUserID)
	c.JSON(http.StatusNoContent, nil)
}

// @Summary Remove a user from a group
// @Description Remove a user from a group
// @Tags Groups
// @Accept json
// @Produce json
// @Param group_id path string true "Group ID"
// @Param user_id path string true "User ID"
// @Success 204 {object} string
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /groups/{group_id}/users/{user_id} [delete]
// @Security Bearer
func RemoveUserFromGroup(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	groupID := c.Param("group_id")
	if !UserOwnsGroup(user.ID, groupID) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User does not have permission to add users to this group"})
		return
	}

	var group models.Group
	result := database.DB.Where("id = ?", groupID).Preload("Users").First(&group)
	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Group not found"})
		return
	}

	if !userCanManageGroup(user.ID, &group) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User does not have permission to remove users from this group"})
		return
	}

	targetUserID := c.Param("user_id")

	result = database.DB.Where("id = ?", targetUserID).First(&user)
	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User not found"})
		return
	}

	database.DB.Model(&group).Association("Users").Delete(&user)
	c.JSON(http.StatusNoContent, nil)
}

// @Summary Update a group name and description
// @Description Update a group name and description
// @Tags Groups
// @Accept json
// @Produce json
// @Param group_id path string true "Group ID"
// @Param group body UpdateGroupRequest true "Group to update"
// @Success 204 {object} string
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /groups/{group_id} [put]
// @Security Bearer
func UpdateGroup(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	groupID := c.Param("group_id")
	var group models.Group
	result := database.DB.Where("id = ?", groupID).First(&group)
	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Group not found"})
		return
	}

	if !userCanManageGroup(user.ID, &group) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User does not have permission to update this group"})
		return
	}

	var req UpdateGroupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	database.DB.Model(&group).Updates(models.Group{
		Name:        req.Name,
		Description: req.Description,
	})
	c.JSON(http.StatusNoContent, nil)
}

// @Summary Get all the groups from a given scope
// @Description Get all the groups from a given scope and list the users in each group
// @Tags Groups
// @Accept json
// @Produce json
// @Param scope_id path string true "Scope ID"
// @Success 200 {array} models.Group
// @Failure 400 {object} map[string]string
// @Router /groups/scope/{scope_id} [get]
func GetGroupsFromScope(c *gin.Context) {
	_, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	scopeID := c.Param("scope_id")
	var scope models.Scope
	result := database.DB.Where("id = ?", scopeID).First(&scope)
	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Scope not found"})
		return
	}

	var groups []models.Group
	result = database.DB.Where("scope_id = ?", scopeID).Preload("Users").Find(&groups)
	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Error while fetching groups"})
		return
	}

	c.JSON(http.StatusOK, groups)
}

// RegisterGroups registers the group routes
func RegisterGroupsRoutes(r *gin.RouterGroup) {
	groups := r.Group("/groups")
	groups.Use(middleware.AuthMiddleware())
	{
		groups.GET("/", GetAllGroups)
		groups.GET("/:group_id", GetGroup)
		groups.GET("/scope/:scope_id", GetGroupsFromScope)
		groups.PUT("/:group_id", UpdateGroup)
		groups.POST("/:group_id/users/:user_id", AddUserToGroup)
		groups.DELETE("/:group_id/users/:user_id", RemoveUserFromGroup)
		groups.POST("/", CreateGroup)
		groups.DELETE("/:group_id", DeleteGroup)
	}
}