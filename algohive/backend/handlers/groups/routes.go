package groups

import (
	"api/middleware"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes enregistre toutes les routes liées à la gestion des groupes
// r: le RouterGroup auquel ajouter les routes
func RegisterRoutes(r *gin.RouterGroup) {
	groups := r.Group("/groups")
	groups.Use(middleware.AuthMiddleware())
	{
		groups.GET("/", GetAllGroups)
		groups.GET("/:group_id", GetGroup)
		groups.GET("/scope/:scope_id", GetGroupsFromScope)
		groups.PUT("/:group_id", UpdateGroup)
		groups.POST("/:group_id/users/:user_id", AddUserToGroup)
		groups.DELETE("/:group_id/users/:user_id", RemoveUserFromGroup)
		groups.POST("/", CreateGroup)
		groups.DELETE("/:group_id", DeleteGroup)
	}
}
