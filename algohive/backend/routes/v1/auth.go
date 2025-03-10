package v1

import (
	"api/database"
	"api/middleware"
	"api/models"
	"api/utils"
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

// RegisterRequest model for registration
type RegisterRequest struct {
    Email     string `json:"email" binding:"required,email"`
    Password  string `json:"password" binding:"required,min=8"`
    Firstname string `json:"firstname" binding:"required"`
    Lastname  string `json:"lastname" binding:"required"`
}

// AuthResponse model for authentication responses
type AuthResponse struct {
    Token  string `json:"token"`
    UserID string `json:"user_id"`
    Email  string `json:"email"`
}

// @Summary User Login
// @Description Authenticate a user and return a JWT token
// @Tags auth
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
    result := database.DB.Where("email = ?", loginReq.Email).First(&user)
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
    
    // Update last connected time
    now := time.Now()
    user.LastConnected = &now
    database.DB.Save(&user)
    
    c.JSON(http.StatusOK, AuthResponse{
        Token:  token,
        UserID: user.ID,
        Email:  user.Email,
    })
}

// @Summary User Register
// @Description Register a new user
// @Tags auth
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
    
    c.JSON(http.StatusCreated, AuthResponse{
        Token:  token,
        UserID: user.ID,
        Email:  user.Email,
    })
}

// @Summary User Logout
// @Description Logout a user by invalidating their token
// @Tags auth
// @Security BearerAuth
// @Success 200 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /auth/logout [post]
func Logout(c *gin.Context) {
    // Get the token from the request
    token := c.GetHeader("Authorization")
    if token == "" {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "No token provided"})
        return
    }
    
    // Extract the actual token from "Bearer token"
    token = token[7:] // Remove "Bearer " prefix
    
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
    
    c.JSON(http.StatusOK, gin.H{"message": "Successfully logged out"})
}

// @Summary Get User Profile
// @Description Get the profile information of the authenticated user
// @Tags Users
// @Security BearerAuth
// @Success 200 {object} models.User
// @Failure 404 {object} map[string]string
// @Router /user/profile [get]
// @Security Bearer
func GetUserProfile(c *gin.Context) {
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
    
    // Hide password from response
    user.Password = ""
    
    c.JSON(http.StatusOK, user)
}

// Register the endpoints for the v1 API
func RegisterAuth(r *gin.RouterGroup) {    
    // Auth routes
    auth := r.Group("/auth")
    {
        auth.POST("/login", Login)
        auth.POST("/register", RegisterUser)
        auth.POST("/logout", middleware.AuthMiddleware(), Logout)
    }
    
    user := r.Group("/user")
    user.Use(middleware.AuthMiddleware())
    {
        user.GET("/profile", GetUserProfile)
    }
}