package web

import (
	"backend/src/db"
	"fmt"
	"log"
	"net/http"
	"os"

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
var debug bool = false
var router *gin.Engine = nil
var logger = log.New(os.Stdout, "[HTTPS] ", log.Ldate|log.Ltime)

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
	debug = debugMode

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
	router.GET("/api/home/:username", authMiddleware(), homeHandler)

	// err := router.RunTLS(fmt.Sprintf("%s:%d", config.Address, config.Port), config.Cert, config.Key)
	err := router.Run(fmt.Sprintf("%s:%d", config.Address, config.Port))
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

	if debug {
		logger.Println("Received login request:", requestData)
	}

	username, _ := requestData["username"].(string)
	password, _ := requestData["password"].(string)

	userExists, err := db.Login(username, password)
	if err != nil {
		logger.Println(err)
		c.JSON(http.StatusOK, gin.H{"error": "Could not communicate with the database!"})
		return
	}

	if !userExists {
		c.JSON(http.StatusOK, gin.H{"error": "Incorrect username or password!"})
		return
	}

	token := generateJwtToken(username)
	c.JSON(http.StatusOK, gin.H{"token": token})
}

func registerHandler(c *gin.Context) {
	var requestData map[string]interface{}
	if err := c.BindJSON(&requestData); err != nil {
		fmt.Println("Error binding JSON:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request"})
		return
	}

	if debug {
		logger.Println("Received register request:", requestData)
	}

	username, _ := requestData["username"].(string)
	password, _ := requestData["password"].(string)
	email, _ := requestData["email"].(string)

	responseMsg, err := db.Register(username, email, password)
	if err != nil {
		logger.Println(err)
		c.JSON(http.StatusOK, gin.H{"error": responseMsg})
		return
	}

	token := generateJwtToken(username)
	c.JSON(http.StatusOK, gin.H{"token": token})
}

func homeHandler(c *gin.Context) {
	username := c.Param("username")
	c.JSON(http.StatusOK, gin.H{"message": fmt.Sprintf("protected for user %s", username)})
}
