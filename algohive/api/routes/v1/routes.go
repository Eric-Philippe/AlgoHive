package v1

import (
	"github.com/gin-gonic/gin"
)

// RegisterRoutes enregistre toutes les routes pour la version 1
// @title AlgoHive API
// @version 1.0
// @description This is the API documentation for AlgoHive.
// @BasePath /api/v1
func RegisterRoutes(r *gin.RouterGroup) {
    RegisterPingRoutes(r)
}