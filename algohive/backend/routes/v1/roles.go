package v1

import (
	"api/handlers/roles"

	"github.com/gin-gonic/gin"
)

// RegisterRolesRoutes enregistre les routes pour l'API v1 des rôles
// Cette fonction sert maintenant de simple proxy vers le package de handlers dédié
func RegisterRolesRoutes(r *gin.RouterGroup) {    
    roles.RegisterRoutes(r)
}