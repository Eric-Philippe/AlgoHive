package users

import (
	"api/middleware"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes enregistre toutes les routes liées à la gestion des utilisateurs
// r: le RouterGroup auquel ajouter les routes
func RegisterRoutes(r *gin.RouterGroup) {    
    user := r.Group("/user")
    user.Use(middleware.AuthMiddleware())
    {
        // Routes pour le profil utilisateur
        user.GET("/profile", GetUserProfile)
        user.PUT("/profile", UpdateUserProfile)
        
        // Routes pour la gestion des utilisateurs
        user.GET("/", GetUsers)
        user.DELETE("/:id", DeleteUser)
        user.PUT("/block/:id", ToggleBlockUser)
        
        // Routes pour les relations utilisateurs-rôles
        user.GET("/roles", GetUsersFromRoles)
        user.POST("/roles", CreateUserAndAttachRoles)
        
        // Routes pour les relations utilisateurs-groupes
        user.POST("/groups", CreateUserAndAttachGroup)
        user.POST("/group/:group_id/bulk", CreateBulkUsersAndAttachGroup)
    }
}
