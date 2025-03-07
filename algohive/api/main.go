package main

import (
	docs "api/docs"
	v1 "api/routes/v1"

	"github.com/gin-gonic/gin"
	swaggerfiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title AlgoHive API
// @version 1.0
// @description This is the web API for the AlgoHive Web App.
//	@termsOfService	http://swagger.io/terms/

//	@contact.name	Éric PHILIPPE
//	@contact.email	ericphlpp@proton.me

//	@license.name	Apache 2.0
//	@license.url	http://www.apache.org/licenses/LICENSE-2.0.html

//	@host		localhost:8080
//	@BasePath	/api/v1
func main() {
    r := gin.Default()
    docs.SwaggerInfo.BasePath = "/api/v1"

    v1Group := r.Group("/api/v1")
    {
        v1.RegisterRoutes(v1Group)
    }

    r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerfiles.Handler))
    r.Run(":8080")
}