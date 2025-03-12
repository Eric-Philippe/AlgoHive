package v1

import (
	"api/database"
	"api/middleware"
	"api/models"
	"api/utils"
	"api/utils/permissions"
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// LoginRequest model for login endpoints
type LoginRequest struct {
    Email    string `json:"email" binding:"required,email"`
    Password string `json:"password" binding:"required"`
}

// convertRoles converts []*models.Role to []models.Role
func convertRoles(roles []*models.Role) []models.Role {
    var result []models.Role
    for _, role := range roles {
        result = append(result, *role)
    }
    return result
}

// convertGroups converts []*models.Group to []models.Group
func convertGroups(groups []*models.Group) []models.Group {
    var result []models.Group
    for _, group := range groups {
        result = append(result, *group)
    }
    return result
}

// RegisterRequest model for registration
type RegisterRequest struct {
    Email     string `json:"email" binding:"required,email"`
    Password  string `json:"password" binding:"required,min=8"`
    Firstname string `json:"firstname" binding:"required"`
    Lastname  string `json:"lastname" binding:"required"`
}

// AuthResponse model for authentication responses
type AuthResponse struct {
    Token         string `json:"token"`
    UserID        string `json:"user_id"`
    Email         string `json:"email"`
    Firstname     string `json:"firstname"`
    Lastname      string `json:"lastname"`
    LastConnected *time.Time `json:"last_connected"`
    Permissions   int `json:"permissions"`
    Roles        []models.Role `json:"roles"`
    Groups       []models.Group `json:"groups"`
}

// setCookieToken sets the authentication token as an HTTP-only secure cookie
func setCookieToken(c *gin.Context, token string) {
    // Set expiration time to match JWT validity (typically 24 hours)
    cookieMaxAge := 24 * 3600 // 24 hours in seconds
    
    c.SetSameSite(http.SameSiteLaxMode)
    c.SetCookie(
        "auth_token",   // name
        token,          // value
        cookieMaxAge,   // max age
        "/",            // path
        "",             // domain
        true,           // secure (HTTPS only)
        true,           // httpOnly (not accessible via JavaScript)
    )
}

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
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    
    var user models.User
    result := database.DB.Where("email = ?", loginReq.Email).Preload("Roles").Preload("Groups").First(&user)
    if result.Error != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
        return
    }
    
    // Check if user is blocked
    if user.Blocked {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Your account has been blocked"})
        return
    }
    
    // Check password
    if !utils.CheckPasswordHash(loginReq.Password, user.Password) {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
        return
    }
    
    // Generate JWT token
    token, err := utils.GenerateJWT(user.ID, user.Email)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
        return
    }
    
    // Set the token as an HTTP-only cookie
    setCookieToken(c, token)
    
    // Update last connected time
    now := time.Now()
    user.LastConnected = &now
    database.DB.Save(&user)
    c.JSON(http.StatusOK, AuthResponse{
        Token:  token,
        UserID: user.ID,
        Email:  user.Email,
        Firstname: user.Firstname,
        Lastname: user.Lastname,
        LastConnected: user.LastConnected,
        Permissions: permissions.MergeRolePermissions(user.Roles),
        Roles: convertRoles(user.Roles),
        Groups: convertGroups(user.Groups),
    })
}

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
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    
    // Check if email already exists
    var existingUser models.User
    result := database.DB.Where("email = ?", registerReq.Email).First(&existingUser)
    if result.Error == nil {
        c.JSON(http.StatusConflict, gin.H{"error": "Email already in use"})
        return
    }
    
    // Hash password
    hashedPassword, err := utils.HashPassword(registerReq.Password)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
        return
    }
    
    // Create new user
    user := models.User{
        Email:     registerReq.Email,
        Password:  hashedPassword,
        Firstname: registerReq.Firstname,
        Lastname:  registerReq.Lastname,
        Blocked:   false,
    }
    
    if err := database.DB.Create(&user).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
        return
    }
    
    // Generate JWT token
    token, err := utils.GenerateJWT(user.ID, user.Email)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
        return
    }
    
    // Set the token as an HTTP-only cookie
    setCookieToken(c, token)
    
    c.JSON(http.StatusCreated, AuthResponse{
        Token:  token,
        UserID: user.ID,
        Email:  user.Email,
        Firstname: user.Firstname,
        Lastname: user.Lastname,
        LastConnected: user.LastConnected,
        Permissions: permissions.MergeRolePermissions(user.Roles),
        Roles: convertRoles(user.Roles),
        Groups: convertGroups(user.Groups),
    })
}

// @Summary User Logout
// @Description Logout a user by invalidating their token
// @Tags Auth
// @Success 200 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /auth/logout [post]
// @Security Bearer
func Logout(c *gin.Context) {
    // Get the token from the cookie first
    token, err := c.Cookie("auth_token")
    
    // If no cookie, try to get from Authorization header
    if err != nil {
        authHeader := c.GetHeader("Authorization")
        if authHeader == "" {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "No token provided"})
            return
        }
        
        // Extract the actual token from "Bearer token"
        token = authHeader[7:] // Remove "Bearer " prefix
    }
    
    // Add token to blacklist in Redis with expiration matching the token's expiration
    // Parse token to get expiration time
    claims, err := utils.ValidateToken(token)
    if err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
        return
    }
    
    // Calculate remaining time until token expiration
    expirationTime := claims.ExpiresAt.Time
    remainingTime := time.Until(expirationTime)
    
    // Add to Redis blacklist
    ctx := context.Background()
    redisKey := "token:blacklist:" + token
    err = database.REDIS.Set(ctx, redisKey, "1", remainingTime).Err()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to logout"})
        return
    }
    
    // Clear the auth cookie
    c.SetCookie("auth_token", "", -1, "/", "", true, true)
    
    c.JSON(http.StatusOK, gin.H{"message": "Successfully logged out"})
}

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
        // Get the token from the cookie first
        token, err := c.Cookie("auth_token")
    
        // If no cookie, try to get from Authorization header
        if err != nil {
            authHeader := c.GetHeader("Authorization")
            if authHeader == "" {
                c.JSON(http.StatusUnauthorized, gin.H{"error": "No token provided"})
                return
            }
            
            // Extract the actual token from "Bearer token"
            token = authHeader[7:] // Remove "Bearer " prefix
        }

        // Validate the token
        claims, err := utils.ValidateToken(token)
        if err != nil {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
            return
        }

        // Get user data
        var user models.User
        result := database.DB.Where("id = ?", claims.UserID).Preload("Roles").Preload("Groups").First(&user)
        if result.Error != nil {
            c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
            return
        }

        c.JSON(http.StatusOK, AuthResponse{
            UserID: user.ID,
            Email:  user.Email,
            Firstname: user.Firstname,
            Lastname: user.Lastname,
            LastConnected: user.LastConnected,
            Permissions: permissions.MergeRolePermissions(user.Roles),
            Roles: convertRoles(user.Roles),
            Groups: convertGroups(user.Groups),
        })
}

// Register the endpoints for the v1 API
func RegisterAuthRoutes(r *gin.RouterGroup) {    
    // Auth routes
    auth := r.Group("/auth")
    {
        auth.POST("/login", Login)
        auth.POST("/register", RegisterUser)
        auth.POST("/logout", middleware.AuthMiddleware(), Logout)
        auth.GET("/check", middleware.AuthMiddleware(), CheckAuth)
    }
}