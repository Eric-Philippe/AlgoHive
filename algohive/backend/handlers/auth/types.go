package auth

import (
	"api/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// Constantes pour les messages d'erreur
const (
	ErrInvalidCredentials  = "Invalid credentials"
	ErrAccountBlocked      = "Your account has been blocked"
	ErrEmailInUse          = "Email already in use"
	ErrHashPasswordFailed  = "Failed to hash password"
	ErrUserCreateFailed    = "Failed to create user"
	ErrTokenGenerateFailed = "Failed to generate token"
	ErrNoTokenProvided     = "No token provided"
	ErrInvalidToken        = "Invalid token"
	ErrInvalidExpiredToken = "Invalid or expired token"
	ErrUserNotFound        = "User not found"
	ErrLogoutFailed        = "Failed to logout"
	ErrLogoutSuccess       = "Successfully logged out"
)

// LoginRequest modèle pour les endpoints de login
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// RegisterRequest modèle pour l'inscription
type RegisterRequest struct {
	Email     string `json:"email" binding:"required,email"`
	Password  string `json:"password" binding:"required,min=8"`
	Firstname string `json:"firstname" binding:"required"`
	Lastname  string `json:"lastname" binding:"required"`
}

// AuthResponse modèle pour les réponses d'authentification
type AuthResponse struct {
	Token         string        `json:"token"`
	UserID        string        `json:"user_id"`
	Email         string        `json:"email"`
	Firstname     string        `json:"firstname"`
	Lastname      string        `json:"lastname"`
	LastConnected *time.Time    `json:"last_connected"`
	Permissions   int           `json:"permissions"`
	Roles         []models.Role  `json:"roles"`
	Groups        []models.Group `json:"groups"`
}

// respondWithError envoie une réponse d'erreur standardisée
func respondWithError(c *gin.Context, status int, message string) {
	c.JSON(status, gin.H{"error": message})
}

// setCookieToken définit le token d'authentification comme un cookie HTTP-only sécurisé
func setCookieToken(c *gin.Context, token string) {
	// Définit le temps d'expiration pour correspondre à la validité du JWT (généralement 24 heures)
	cookieMaxAge := 24 * 3600 // 24 heures en secondes
	
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(
		"auth_token",   // nom
		token,          // valeur
		cookieMaxAge,   // âge max
		"/",            // chemin
		"",             // domaine
		true,           // secure (HTTPS seulement)
		true,           // httpOnly (non accessible via JavaScript)
	)
}
