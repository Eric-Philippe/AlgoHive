package auth

import (
	"api/middleware"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes enregistre toutes les routes liées à l'authentification
// r: le RouterGroup auquel ajouter les routes
func RegisterRoutes(r *gin.RouterGroup) {
	auth := r.Group("/auth")
	{
		auth.POST("/login", Login)
		auth.POST("/register", RegisterUser)
		auth.POST("/logout", middleware.AuthMiddleware(), Logout)
		auth.GET("/check", middleware.AuthMiddleware(), CheckAuth)
	}
}
