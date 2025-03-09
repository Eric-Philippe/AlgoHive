package main

import (
	"api/database"
	docs "api/docs"
	v1 "api/routes/v1"
	"os"

	"log"

	"github.com/gin-gonic/gin"
	swaggerfiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func main() {
    database.InitDB()
    gin.SetMode(gin.ReleaseMode)
    r := gin.Default()
    docs.SwaggerInfo.BasePath = "/api/v1"

    v1Group := r.Group("/api/v1")
    {
        v1.RegisterRoutes(v1Group)
    }

    r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerfiles.Handler))

    port := os.Getenv("API_PORT")
    log.Println("Server is running on port: ", port)
    r.Run(":" + port)
}