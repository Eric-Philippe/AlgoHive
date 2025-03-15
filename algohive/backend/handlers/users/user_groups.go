package users

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

// CreateUserAndAttachGroup crée un utilisateur et lui attache des groupes
// @Summary Create a user and attach one or more groups
// @Description Create a new user and attach one or more roles to it
// @Tags Users
// @Accept json
// @Produce json
// @Param UserWithGroup body UserWithGroup true "User Profile with Groups"
// @Success 201 {object} models.User
// @Failure 400 {object} map[string]string
// @Router /user/groups [post]
// @Security Bearer
func CreateUserAndAttachGroup(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	// Vérifier les permissions
	if !permissions.IsStaff(user) && !permissions.RolesHavePermission(user.Roles, permissions.OWNER) {
		respondWithError(c, http.StatusUnauthorized, ErrNoPermissionGroups)
		return
	}

	var userWithGroups UserWithGroup
	if err := c.ShouldBindJSON(&userWithGroups); err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	// Vérifier que les groupes existent
	var groups []models.Group
	if err := database.DB.Where("id IN (?)", userWithGroups.Group).Find(&groups).Error; err != nil {
		log.Printf("Error finding groups: %v", err)
		respondWithError(c, http.StatusNotFound, ErrGroupNotFound)
		return
	}
	
	if len(groups) == 0 {
		respondWithError(c, http.StatusNotFound, ErrGroupNotFound)
		return
	}

	// Créer l'utilisateur
	targetUser, err := createUser(userWithGroups.FirstName, userWithGroups.LastName, userWithGroups.Email)
	if err != nil {
		log.Printf("Error creating user: %v", err)
		respondWithError(c, http.StatusInternalServerError, ErrFailedToHashPassword)
		return
	}

	// Associer les groupes à l'utilisateur
	for i := range groups {
		if err := database.DB.Model(targetUser).Association("Groups").Append(&groups[i]); err != nil {
			log.Printf("Error attaching group to user: %v", err)
			respondWithError(c, http.StatusInternalServerError, "Failed to attach group to user")
			return
		}
	}

	c.JSON(http.StatusCreated, targetUser)
}

// CreateBulkUsersAndAttachGroup crée plusieurs utilisateurs et leur attache un groupe
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

	// Vérifier les permissions
	if !UserOwnsTargetGroups(user.ID, groupID) {
		respondWithError(c, http.StatusUnauthorized, "User does not have permission to create users")
		return
	}
	
	// Vérifier que le groupe existe
	var group models.Group
	if err := database.DB.Where("id = ?", groupID).First(&group).Error; err != nil {
		respondWithError(c, http.StatusNotFound, ErrGroupNotFound)
		return
	}
	
	// Récupérer les utilisateurs à créer
	var users []models.User
	if err := c.ShouldBindJSON(&users); err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}
	
	// Créer les utilisateurs et leur associer le groupe
	for i := range users {
		users[i].Groups = append(users[i].Groups, &group)
		hashedPassword, err := utils.HashPassword(users[i].Password)
		if err != nil {
			respondWithError(c, http.StatusInternalServerError, ErrFailedToHashPassword)
			return
		}
		users[i].Password = hashedPassword
		if err := database.DB.Create(&users[i]).Error; err != nil {
			log.Printf("Error creating bulk users: %v", err)
			respondWithError(c, http.StatusInternalServerError, "Failed to create users")
			return
		}
	}
	
	c.JSON(http.StatusCreated, users)
}
