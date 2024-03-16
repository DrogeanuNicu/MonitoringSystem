package router

import (
	"fmt"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

var router *gin.Engine = nil

func Init(address string, port int, cert string, privateKey string, debugMode bool) error {

	if cert == "" {
		panic("Please provide the path to the HTTPS TLS certificate")
	}

	if privateKey == "" {
		panic("Please provide the path to the HTTPS TLS private key")
	}

	if debugMode {
		gin.SetMode(gin.DebugMode)
	} else {
		gin.SetMode(gin.ReleaseMode)
	}

	router = gin.New()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Length", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	router.GET("/api/hello", HelloHandler)

	// err := router.RunTLS(fmt.Sprintf("%s:%d", address, port), cert, privateKey)
	err := router.Run(fmt.Sprintf("%s:%d", address, port))
	if err != nil {
		return err
	}

	return nil
}

func HelloHandler(c *gin.Context) {
	c.JSON(200, gin.H{"message": "Hello from the gin server!"})
}
