package main

import (
	"api/config"
	"api/database"
	docs "api/docs"
	v1 "api/routes/v1"

	"log"

	"github.com/gin-gonic/gin"
	swaggerfiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title Swagger AlgoHive API
// @version 1.0.0
// @description This is the API documentation for the AlgoHive API

// @contact.name AlgoHive Support
// @contact.email ericphlpp@proton.me

// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html

// @BasePath /api/v1
func main() {
    config.LoadConfig()
    log.Println("Config loaded")

    database.InitDB()
    log.Println("Database connected")

    database.InitRedis()
    log.Println("Redis connected")

    gin.SetMode(gin.ReleaseMode)
    r := gin.New()
    docs.SwaggerInfo.BasePath = "/api/v1"

    v1.Register(r)
    r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerfiles.Handler))

    port := config.ApiPort
    log.Println("Server is running on port: ", port)
    log.Println("Swagger is running on http://localhost:" + port + "/swagger/index.html")
    r.Run(":" + port)
}