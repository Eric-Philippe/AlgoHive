package scopes

import (
	"api/middleware"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes enregistre toutes les routes liées aux scopes
// r: le RouterGroup auquel ajouter les routes
func RegisterRoutes(r *gin.RouterGroup) {
	scopes := r.Group("/scopes")
	scopes.Use(middleware.AuthMiddleware())
	{
		// Routes CRUD de base
		scopes.POST("/", CreateScope)
		scopes.GET("/", GetAllScopes)
		scopes.GET("/:scope_id", GetScope)
		scopes.PUT("/:scope_id", UpdateScope)
		scopes.DELETE("/:scope_id", DeleteScope)
		
		// Routes spécifiques à l'utilisateur
		scopes.GET("/user", GetUserScopes)
		
		// Routes pour les relations avec les rôles
		scopes.GET("/roles", GetRoleScopes)
		scopes.POST("/:scope_id/roles/:role_id", AttachScopeToRole)
		scopes.DELETE("/:scope_id/roles/:role_id", DetachScopeFromRole)
	}
}
