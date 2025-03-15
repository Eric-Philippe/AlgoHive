package roles

import (
	"api/middleware"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes enregistre toutes les routes liées à la gestion des rôles
// r: le RouterGroup auquel ajouter les routes
func RegisterRoutes(r *gin.RouterGroup) {    
    roles := r.Group("/roles")
    roles.Use(middleware.AuthMiddleware())
    {
		roles.POST("/", CreateRole)
		roles.GET("/", GetAllRoles)
		roles.GET("/:role_id", GetRoleByID)
		roles.PUT("/:role_id", UpdateRoleByID)
		roles.DELETE("/:role_id", DeleteRole)
        
        // Déplacer les routes utilisateur-rôle sous /roles pour éviter les conflits
        roles.POST("/attach/:role_id/to-user/:user_id", AttachRoleToUser)
        roles.DELETE("/detach/:role_id/from-user/:user_id", DetachRoleFromUser)
    }
}
