package router

import (
	"fmt"

	"github.com/gin-gonic/gin"
)

var router *gin.Engine = nil

func Init(address string, port int, debugMode bool) error {
	if debugMode {
		gin.SetMode(gin.DebugMode)
	} else {
		gin.SetMode(gin.ReleaseMode)
	}

	router = gin.Default()
	router.GET("/api/hello", HelloHandler)

	err := router.Run(fmt.Sprintf("%s:%d", address, port))
	if err != nil {
		return err
	}

	return nil
}

func HelloHandler(c *gin.Context) {
	c.JSON(200, gin.H{"message": "Hello from the gin server!"})
}
