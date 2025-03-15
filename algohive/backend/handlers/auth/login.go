package auth

import (
	"api/database"
	"api/models"
	"api/utils"
	"api/utils/permissions"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// Login gère l'authentification d'un utilisateur et retourne un token JWT
// @Summary User Login
// @Description Authenticate a user and return a JWT token
// @Tags Auth
// @Accept json
// @Produce json
// @Param login body LoginRequest true "Login Credentials"
// @Success 200 {object} AuthResponse
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /auth/login [post]
func Login(c *gin.Context) {
	var loginReq LoginRequest
	
	if err := c.ShouldBindJSON(&loginReq); err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}
	
	var user models.User
	if err := database.DB.Where("email = ?", loginReq.Email).Preload("Roles").Preload("Groups").First(&user).Error; err != nil {
		log.Printf("Login failed for %s: user not found", loginReq.Email)
		respondWithError(c, http.StatusUnauthorized, ErrInvalidCredentials)
		return
	}
	
	// Vérifier si l'utilisateur est bloqué
	if user.Blocked {
		log.Printf("Login attempt for blocked account: %s", loginReq.Email)
		respondWithError(c, http.StatusUnauthorized, ErrAccountBlocked)
		return
	}
	
	// Vérifier le mot de passe
	if !utils.CheckPasswordHash(loginReq.Password, user.Password) {
		log.Printf("Login failed for %s: invalid password", loginReq.Email)
		respondWithError(c, http.StatusUnauthorized, ErrInvalidCredentials)
		return
	}
	
	// Générer un token JWT
	token, err := utils.GenerateJWT(user.ID, user.Email)
	if err != nil {
		log.Printf("Failed to generate token for user %s: %v", user.ID, err)
		respondWithError(c, http.StatusInternalServerError, ErrTokenGenerateFailed)
		return
	}
	
	// Définir le token comme un cookie HTTP-only
	setCookieToken(c, token)
	
	// Mettre à jour le temps de dernière connexion
	now := time.Now()
	user.LastConnected = &now
	if err := database.DB.Save(&user).Error; err != nil {
		log.Printf("Failed to update last connection time for user %s: %v", user.ID, err)
	}

	c.JSON(http.StatusOK, AuthResponse{
		Token:         token,
		UserID:        user.ID,
		Email:         user.Email,
		Firstname:     user.Firstname,
		Lastname:      user.Lastname,
		LastConnected: user.LastConnected,
		Permissions:   permissions.MergeRolePermissions(user.Roles),
		Roles:         utils.ConvertRoles(user.Roles),
		Groups:        utils.ConvertGroups(user.Groups),
	})
}
