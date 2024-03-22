package router

import (
	"fmt"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// ================================================================================================
//
//	Global Types
//
// ================================================================================================
type HttpsConfig struct {
	Address string `json:"Address"`
	Port    int    `json:"Port"`
	Cert    string `json:"Cert"`
	Key     string `json:"Key"`
}

// ================================================================================================
//
//	Local Types
//
// ================================================================================================

// ================================================================================================
//
//	Global Variables
//
// ================================================================================================

// ================================================================================================
//
//	Local Variables
//
// ================================================================================================
var router *gin.Engine = nil

// ================================================================================================
//
//	Global Functions
//
// ================================================================================================
func Init(config *HttpsConfig, debugMode bool) {
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

	router.POST("/api/login", loginHandler)
	router.POST("/api/register", registerHandler)

	err := router.RunTLS(fmt.Sprintf("%s:%d", config.Address, config.Port), config.Cert, config.Key)
	// err := router.Run(fmt.Sprintf("%s:%d", config.Address, config.Port))
	if err != nil {
		panic(err)
	}
}

// ================================================================================================
//
//	Local Functions
//
// ================================================================================================
func loginHandler(c *gin.Context) {
	var requestData map[string]interface{}
	if err := c.BindJSON(&requestData); err != nil {
		fmt.Println("Error binding JSON:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request"})
		return
	}

	fmt.Println("Received login request:", requestData)
	c.JSON(http.StatusOK, gin.H{"message": "Login request received"})
}

func registerHandler(c *gin.Context) {
	var requestData map[string]interface{}
	if err := c.BindJSON(&requestData); err != nil {
		fmt.Println("Error binding JSON:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request"})
		return
	}

	fmt.Println("Received register request:", requestData)
	c.JSON(http.StatusOK, gin.H{"message": "Register request received"})
}
