package auth

import (
	"api/database"
	"api/models"
	"api/utils"
	"api/utils/permissions"
	"context"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// getTokenFromRequest récupère le token depuis le cookie ou l'en-tête Authorization
func getTokenFromRequest(c *gin.Context) (string, error) {
	// Essayer d'abord de récupérer le token depuis le cookie
	token, err := c.Cookie("auth_token")
	
	// Si pas de cookie, essayer l'en-tête Authorization
	if err != nil {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			return "", http.ErrNoCookie
		}
		
		// Extraire le token réel depuis "Bearer token"
		token = authHeader[7:] // Supprimer le préfixe "Bearer "
	}
	
	return token, nil
}

// Logout gère la déconnexion d'un utilisateur en invalidant son token
// @Summary User Logout
// @Description Logout a user by invalidating their token
// @Tags Auth
// @Success 200 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /auth/logout [post]
// @Security Bearer
func Logout(c *gin.Context) {
	// Récupérer le token
	token, err := getTokenFromRequest(c)
	if err != nil {
		respondWithError(c, http.StatusUnauthorized, ErrNoTokenProvided)
		return
	}
	
	// Valider le token pour obtenir l'heure d'expiration
	claims, err := utils.ValidateToken(token)
	if err != nil {
		respondWithError(c, http.StatusUnauthorized, ErrInvalidToken)
		return
	}
	
	// Calculer le temps restant jusqu'à l'expiration du token
	expirationTime := claims.ExpiresAt.Time
	remainingTime := time.Until(expirationTime)
	
	// Ajouter à la liste noire de Redis
	ctx := context.Background()
	redisKey := "token:blacklist:" + token
	err = database.REDIS.Set(ctx, redisKey, "1", remainingTime).Err()
	if err != nil {
		log.Printf("Failed to add token to blacklist: %v", err)
		respondWithError(c, http.StatusInternalServerError, ErrLogoutFailed)
		return
	}
	
	// Effacer le cookie d'authentification
	c.SetCookie("auth_token", "", -1, "/", "", true, true)
	
	c.JSON(http.StatusOK, gin.H{"message": ErrLogoutSuccess})
}

// CheckAuth vérifie si le token de session envoyé est toujours valide et retourne les données utilisateur
// @Summary Check if the sent cookie token session is still valid and return user data
// @Description Check if the sent cookie token session is still valid and return user data
// @Tags Auth
// @Accept json
// @Produce json
// @Success 200 {object} AuthResponse
// @Failure 401 {object} map[string]string
// @Router /auth/check [get]
// @Security Bearer
func CheckAuth(c *gin.Context) {
	// Récupérer le token
	token, err := getTokenFromRequest(c)
	if err != nil {
		respondWithError(c, http.StatusUnauthorized, ErrNoTokenProvided)
		return
	}
	
	// Valider le token
	claims, err := utils.ValidateToken(token)
	if err != nil {
		respondWithError(c, http.StatusUnauthorized, ErrInvalidExpiredToken)
		return
	}
	
	// Récupérer les données utilisateur
	var user models.User
	if err := database.DB.Where("id = ?", claims.UserID).Preload("Roles").Preload("Groups").First(&user).Error; err != nil {
		log.Printf("User not found during auth check: %s", claims.UserID)
		respondWithError(c, http.StatusNotFound, ErrUserNotFound)
		return
	}
	
	c.JSON(http.StatusOK, AuthResponse{
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
