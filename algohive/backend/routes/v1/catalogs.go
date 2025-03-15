package v1

import (
	"api/handlers/catalogs"

	"github.com/gin-gonic/gin"
)

// RegisterApisRoutes enregistre les routes pour l'API v1 des catalogues
// Cette fonction sert maintenant de simple proxy vers le package de handlers dédié
func RegisterApisRoutes(r *gin.RouterGroup) {
	catalogs.RegisterRoutes(r)
}