package v1

import (
	"api/handlers/competitions"

	"github.com/gin-gonic/gin"
)

// RegisterCompetitionsRoutes enregistre les routes pour l'API v1 des compétitions
// Cette fonction sert de proxy vers le package de handlers dédié
func RegisterCompetitionsRoutes(r *gin.RouterGroup) {
	competitions.RegisterRoutes(r)
}
