package v1

import (
	"github.com/gin-gonic/gin"
)

// Register the endpoints for the v1 API
func Register(r *gin.Engine) {
    v1 := r.Group("/api/v1")

	RegisterPingRoutes(v1)
	RegisterAuth(v1)
}