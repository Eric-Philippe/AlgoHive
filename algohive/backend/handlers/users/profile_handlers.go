package users

import (
	"api/database"
	"api/middleware"
	"api/models"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetUserProfile récupère le profil de l'utilisateur authentifié
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
    
    // Hide password from response for security
    user.Password = ""
    
    c.JSON(http.StatusOK, user)
}

// UpdateUserProfile met à jour le profil de l'utilisateur authentifié
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
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}
	
	// Update only allowed fields
	user.Email = userUpdate.Email
	user.Firstname = userUpdate.Firstname
	user.Lastname = userUpdate.Lastname
	
	if err := database.DB.Save(&user).Error; err != nil {
		log.Printf("Error updating user profile: %v", err)
		respondWithError(c, http.StatusInternalServerError, "Failed to update profile")
		return
	}
	
	c.JSON(http.StatusOK, user)
}
