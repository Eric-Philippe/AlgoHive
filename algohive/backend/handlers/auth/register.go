package auth

import (
	"api/database"
	"api/models"
	"api/utils"
	"api/utils/permissions"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// RegisterUser gère l'inscription d'un nouvel utilisateur
// @Summary User Register
// @Description Register a new user
// @Tags Auth
// @Accept json
// @Produce json
// @Param register body RegisterRequest true "Registration Details"
// @Success 201 {object} AuthResponse
// @Failure 400 {object} map[string]string
// @Failure 409 {object} map[string]string
// @Router /auth/register [post]
func RegisterUser(c *gin.Context) {
	var registerReq RegisterRequest
	
	if err := c.ShouldBindJSON(&registerReq); err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}
	
	// Vérifier si l'email existe déjà
	var existingUser models.User
	if err := database.DB.Where("email = ?", registerReq.Email).First(&existingUser).Error; err == nil {
		log.Printf("Registration failed: email already in use: %s", registerReq.Email)
		respondWithError(c, http.StatusConflict, ErrEmailInUse)
		return
	}
	
	// Hasher le mot de passe
	hashedPassword, err := utils.HashPassword(registerReq.Password)
	if err != nil {
		log.Printf("Failed to hash password during registration: %v", err)
		respondWithError(c, http.StatusInternalServerError, ErrHashPasswordFailed)
		return
	}
	
	// Créer un nouvel utilisateur
	user := models.User{
		Email:     registerReq.Email,
		Password:  hashedPassword,
		Firstname: registerReq.Firstname,
		Lastname:  registerReq.Lastname,
		Blocked:   false,
	}
	
	if err := database.DB.Create(&user).Error; err != nil {
		log.Printf("Failed to create user: %v", err)
		respondWithError(c, http.StatusInternalServerError, ErrUserCreateFailed)
		return
	}
	
	// Générer un token JWT
	token, err := utils.GenerateJWT(user.ID, user.Email)
	if err != nil {
		log.Printf("Failed to generate token for new user %s: %v", user.ID, err)
		respondWithError(c, http.StatusInternalServerError, ErrTokenGenerateFailed)
		return
	}
	
	// Définir le token comme un cookie HTTP-only
	setCookieToken(c, token)
	
	c.JSON(http.StatusCreated, AuthResponse{
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
