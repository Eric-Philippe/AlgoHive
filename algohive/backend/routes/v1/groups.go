package v1

import (
	"api/handlers/groups"

	"github.com/gin-gonic/gin"
)

// RegisterGroupsRoutes enregistre les routes pour l'API v1 des groupes
// Cette fonction sert maintenant de simple proxy vers le package de handlers dédié
func RegisterGroupsRoutes(r *gin.RouterGroup) {
	groups.RegisterRoutes(r)
}