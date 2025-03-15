package v1

import (
	"api/handlers/auth"

	"github.com/gin-gonic/gin"
)

// RegisterAuthRoutes enregistre les routes pour l'API v1 d'authentification
// Cette fonction sert maintenant de simple proxy vers le package de handlers dédié
func RegisterAuthRoutes(r *gin.RouterGroup) {
	auth.RegisterRoutes(r)
}