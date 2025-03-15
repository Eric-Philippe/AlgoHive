package competitions

import (
	"api/middleware"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes enregistre toutes les routes liées aux compétitions
// r: le RouterGroup auquel ajouter les routes
func RegisterRoutes(r *gin.RouterGroup) {
	competitions := r.Group("/competitions")
	competitions.Use(middleware.AuthMiddleware())
	{
		// Routes de gestion des compétitions
		competitions.GET("/", GetAllCompetitions)
		competitions.GET("/user", GetUserCompetitions)
		competitions.GET("/:id", GetCompetition)
		competitions.POST("/", CreateCompetition)
		competitions.PUT("/:id", UpdateCompetition)
		competitions.DELETE("/:id", DeleteCompetition)
		
		// Routes de gestion des groupes de compétition
		competitions.GET("/:id/groups", GetCompetitionGroups)
		competitions.POST("/:id/groups/:group_id", AddGroupToCompetition)
		competitions.DELETE("/:id/groups/:group_id", RemoveGroupFromCompetition)
		
		// Routes de gestion des essais
		competitions.GET("/:id/tries", GetCompetitionTries)
		competitions.POST("/:id/tries", StartCompetitionTry)
		competitions.PUT("/:id/tries/:try_id", FinishCompetitionTry)
		competitions.GET("/:id/users/:user_id/tries", GetUserCompetitionTries)
		
		// Routes de statistiques
		competitions.GET("/:id/statistics", GetCompetitionStatistics)
	}
}
