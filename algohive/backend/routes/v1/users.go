package v1

import (
	"api/database"
	"api/middleware"
	"api/models"
	"api/utils"
	"api/utils/permissions"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type UserWithRoles struct {
	User  models.User `json:"user"`
	Roles []string    `json:"roles"`
}

// Func to check all the groups from a target user and see if at least one of theme is owned by the authenticated user
func UserOwnsGroup(userID string, targetUserID string) bool {
	type GroupIds struct {
		ID []string
	}
	
	var result GroupIds
	err := database.DB.Raw(`
		SELECT DISTINCT g.id
			FROM groups g
			JOIN scopes s ON g.scope_id = s.id
			JOIN role_scopes rs ON s.id = rs.scope_id
			JOIN roles r ON rs.role_id = r.id
			JOIN user_roles ur ON r.id = ur.role_id
			WHERE ur.user_id = 'da58cef5-4e0f-45d1-8168-1be0afa08196'
	`, userID).Scan(&result).Error

	if err != nil {
		return false
	}

	// Get all the group IDs from the target user
	var targetGroupIds GroupIds
	err = database.DB.Where("id = ?", targetUserID).Preload("Groups").First(&targetGroupIds).Error
	if err != nil {
		return false
	}

	// Check if the authenticated user owns any of the target user's groups
	for _, groupID := range targetGroupIds.ID {
		for _, ownedGroupID := range result.ID {
			if groupID == ownedGroupID {
				return true
			}
		}
	}

	return false
}

// @Summary Get User Profile
// @Description Get the profile information of the authenticated user
// @Tags Users
// @Success 200 {object} models.User
// @Failure 404 {object} map[string]string
// @Router /user/profile [get]
// @Security Bearer
func GetUserProfile(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}
    
    // Hide password from response
    user.Password = ""
    
    c.JSON(http.StatusOK, user)
}

// @Summary Update User Profile
// @Description Update the profile information of the authenticated user
// @Tags Users
// @Accept json
// @Produce json
// @Param user body models.User true "User Profile"
// @Success 200 {object} models.User
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /user/profile [put]
// @Security Bearer
func UpdateUserProfile(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}
	
	var userUpdate models.User
	if err := c.ShouldBindJSON(&userUpdate); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	user.Email = userUpdate.Email
	user.Firstname = userUpdate.Firstname
	user.Lastname = userUpdate.Lastname
	database.DB.Save(&user)
	
	c.JSON(http.StatusOK, user)
}

// @Summary Create User and attach a Group
// @Description Create a new user and attach a group to it
// @Tags Users
// @Accept json
// @Produce json
// @Param user body models.User true "User Profile"
// @Param group_id path string true "Group ID"
// @Success 201 {object} models.User
// @Failure 400 {object} map[string]string
// @Router /user/group/{group_id} [post]
// @Security Bearer
func CreateUserAndAttachGroup(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	groupID := c.Param("group_id")

	if !UserOwnsGroup(user.ID, groupID) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User does not have permission to create users"})
		return
	}
	
	var group models.Group
	result := database.DB.Where("id = ?", groupID).First(&group)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Group not found"})
		return
	}
	
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	user.Groups = append(user.Groups, &group)
	hashedPassword, err := utils.HashPassword(user.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}
	user.Password = hashedPassword
	database.DB.Create(&user)
	
	c.JSON(http.StatusCreated, user)
}

// @Summary Create Bulk Users and attach a Group
// @Description Create multiple new users and attach a group to them
// @Tags Users
// @Accept json
// @Produce json
// @Param users body []models.User true "Users Profiles"
// @Param group_id path string true "Group ID"
// @Success 201 {object} models.User
// @Failure 400 {object} map[string]string
// @Router /user/group/{group_id}/bulk [post]
// @Security Bearer
func CreateBulkUsersAndAttachGroup(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	groupID := c.Param("group_id")

	if !UserOwnsGroup(user.ID, groupID) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User does not have permission to create users"})
		return
	}
	
	var group models.Group
	result := database.DB.Where("id = ?", groupID).First(&group)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Group not found"})
		return
	}
	
	var users []models.User
	if err := c.ShouldBindJSON(&users); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	for i := range users {
		users[i].Groups = append(users[i].Groups, &group)
		hashedPassword, err := utils.HashPassword(users[i].Password)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
			return
		}
		users[i].Password = hashedPassword
		database.DB.Create(&users[i])
	}
	
	c.JSON(http.StatusCreated, users)
}

// @Summary Create a new user and attach roles
// @Description Create a new user and attach roles to it
// @Tags Users
// @Accept json
// @Produce json
// @Param userWithRoles body UserWithRoles true "User and Roles"
// @Success 201 {object} models.User
// @Failure 400 {object} map[string]string
// @Router /user/roles [post]
// @Security Bearer
func CreateUserAndAttachRoles(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	if !permissions.RolesHavePermission(user.Roles, permissions.ROLES) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User does not have permission to create users with roles"})
		return
	}

	var userWithRoles UserWithRoles
	if err := c.ShouldBindJSON(&userWithRoles); err != nil {	
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var roles []models.Role
	result := database.DB.Where("id IN (?)", userWithRoles.Roles).Find(&roles)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Role not found"})
		return
	}

	user = userWithRoles.User
	user.Roles = make([]*models.Role, len(roles))
	for i := range roles {
		user.Roles[i] = &roles[i]
	}

	hashedPassword, err := utils.HashPassword(user.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}
	user.Password = hashedPassword
	database.DB.Create(&user)

	c.JSON(http.StatusCreated, user)
}

// @Summary Get All users that the curren user has access to 
// @Description Get all users that the current user has access to from his roles -> scopes -> groups
// @Tags Users
// @Success 200 {object} []models.User
// @Router /user/ [get]
// @Security Bearer
func GetUsers(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	var users []models.User
	if permissions.RolesHavePermission(user.Roles, permissions.OWNER) {
		err = database.DB.Preload("Roles").Preload("Groups").Find(&users).Error
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get users"})
			return
		}
	} else {
		if len(user.Roles) == 0 {
			// Only return the users that are in the same groups as the authenticated user
			err = database.DB.Raw(`
			SELECT DISTINCT u.*
				FROM users u
				JOIN user_groups ug ON u.id = ug.user_id
				JOIN groups g ON ug.group_id = g.id
				JOIN user_groups aug ON g.id = aug.group_id
				JOIN users au ON aug.user_id = au.id
				WHERE au.id = ?
		`, user.ID).Scan(&users).Error

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get users"})
				return
			}
		} else {
			var userIDs []string
			err = database.DB.Raw(`
				SELECT DISTINCT u.id
					FROM users u
					JOIN user_groups ug ON u.id = ug.user_id
					JOIN groups g ON ug.group_id = g.id
					JOIN scopes s ON g.scope_id = s.id
					JOIN role_scopes rs ON s.id = rs.scope_id
					JOIN roles r ON rs.role_id = r.id
					JOIN user_roles ur ON r.id = ur.role_id
					WHERE ur.user_id = ?
			`, user.ID).Pluck("id", &userIDs).Error
			
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get users"})
				return
			}
			
			// Then use GORM to get the users with their associations
			if len(userIDs) > 0 {
				err = database.DB.Preload("Roles").Preload("Groups").Where("id IN ?", userIDs).Find(&users).Error
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get users"})
					return
				}
			}
		}
	}

	c.JSON(http.StatusOK, users)
}

// @Summary Get All users that the given roles have access to
// @Description Get all users that the given roles have access to from their roles -> scopes -> groups -> users
// @Tags Users
// @Param roles query []string true "Roles IDs"
// @Success 200 {object} []models.User
// @Router /user/roles [get]
// @Security Bearer
func GetUsersFromRoles(c *gin.Context) {
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

	var userIDs []string
	err = database.DB.Raw(`
		SELECT DISTINCT u.id
			FROM users u
			JOIN user_groups ug ON u.id = ug.user_id
			JOIN groups g ON ug.group_id = g.id
			JOIN scopes s ON g.scope_id = s.id
			JOIN role_scopes rs ON s.id = rs.scope_id
			JOIN roles r ON rs.role_id = r.id
			WHERE r.id IN ?
	`, roles).Pluck("id", &userIDs).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get users"})
		return
	}

	var users []models.User
	if len(userIDs) > 0 {
		err = database.DB.Preload("Roles").Preload("Groups").Where("id IN ?", userIDs).Find(&users).Error
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get users"})
			return
		}
	}

	c.JSON(http.StatusOK, users)
}

// Register the endpoints for the v1 API
func RegisterUserRoutes(r *gin.RouterGroup) {    
    user := r.Group("/user")
    user.Use(middleware.AuthMiddleware())
    {
        user.GET("/profile", GetUserProfile)
		user.GET("/", GetUsers)
		user.GET("/roles", GetUsersFromRoles)
		user.PUT("/profile", UpdateUserProfile)
		user.POST("/group/:group_id", CreateUserAndAttachGroup)
		user.POST("/group/:group_id/bulk", CreateBulkUsersAndAttachGroup)
		user.POST("/roles", CreateUserAndAttachRoles)
    }
}