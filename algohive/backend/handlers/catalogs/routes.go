package catalogs

import (
	"api/middleware"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes enregistre toutes les routes liées aux catalogues
// r: le RouterGroup auquel ajouter les routes
func RegisterRoutes(r *gin.RouterGroup) {
	catalogs := r.Group("/catalogs")
	catalogs.Use(middleware.AuthMiddleware())
	{
		catalogs.GET("/", GetAllCatalogs)
		catalogs.GET("/:catalogID/themes", GetThemesFromCatalog)
	}
}
