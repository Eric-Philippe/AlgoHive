package v1

import (
	"github.com/gin-gonic/gin"
)

// @Summary Répond avec "pong"
// @Description Route de test
// @Tags App
// @Produce json
// @Success 200 {object} map[string]string
// @Router /ping [get]
func pong(c *gin.Context) {
    c.JSON(200, gin.H{
        "message": "pong",
    })
}

// RegisterPingRoutes enregistre les routes de test pour la version 1
func RegisterPingRoutes(r *gin.RouterGroup) {
    r.GET("/ping", pong)
}