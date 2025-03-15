package v1

import (
	"api/handlers/users"

	"github.com/gin-gonic/gin"
)

// RegisterUserRoutes enregistre les endpoints pour l'API v1 des utilisateurs
// Cette fonction sert maintenant de simple proxy vers le package de handlers dédié
func RegisterUserRoutes(r *gin.RouterGroup) {
    users.RegisterRoutes(r)
}