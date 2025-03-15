package v1

import (
	"api/handlers/scopes"

	"github.com/gin-gonic/gin"
)

// RegisterScopesRoutes enregistre les routes pour l'API v1 des scopes
// Cette fonction sert maintenant de simple proxy vers le package de handlers dédié
func RegisterScopesRoutes(r *gin.RouterGroup) {
	scopes.RegisterRoutes(r)
}