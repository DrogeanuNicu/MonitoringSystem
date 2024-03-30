package web

import (
	"backend/src/dashboard"
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
	router.GET("/api/home/:username/boards", authMiddleware(), getBoardsHandler)
	/* TODO: Investigate if it is necessary for the route to contain :board as it already is part of the body */
	/* TODO: Make the api routes more general, remove /home/ */
	router.POST("/api/home/:username/add/:board", authMiddleware(), addBoardHandler)
	router.POST("/api/home/:username/edit/:board", authMiddleware(), editBoardHandler)
	router.POST("/api/home/:username/delete/:board", authMiddleware(), deleteBoardHandler)
	router.GET("/api/home/:username/config/:board", authMiddleware(), getBoardConfigHandler)

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
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request!"})
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
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request!"})
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

func getBoardsHandler(c *gin.Context) {
	username := c.Param("username")
	boards, err := db.GetBoards(username)
	if err != nil {
		logger.Println(err)
		c.JSON(http.StatusOK, gin.H{"error": "Could not communicate with the database!"})
		return
	}

	if len(boards) == 0 {
		c.JSON(http.StatusOK, gin.H{"boards": []string{}})
		return
	}

	c.JSON(http.StatusOK, gin.H{"boards": boards})
}

func addBoardHandler(c *gin.Context) {
	username := c.Param("username")
	var boardData dashboard.BoardData

	parseBoardData(c, &boardData)

	err := db.AddBoard(username, &boardData)
	if err != nil {
		logger.Println(err)
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Could not add the %s board into the database!", boardData.Board)})
		return
	}

	/* TODO: Analyze if it makes sense to query the DB one more time in order to return the full list of the boards => solves sync problem between different terminals */
	c.JSON(http.StatusOK, gin.H{})
}

func editBoardHandler(c *gin.Context) {
	username := c.Param("username")
	oldBoard := c.Param("board")
	var boardData dashboard.BoardData

	err := parseBoardData(c, &boardData)
	if err != nil {
		logger.Println(err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request!"})
		return
	}

	err = db.EditBoard(username, &boardData, oldBoard)
	if err != nil {
		logger.Println(err)
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Could not edit the %s board into the database!", boardData.Board)})
		return
	}

	c.JSON(http.StatusOK, gin.H{})
}

func deleteBoardHandler(c *gin.Context) {
	username := c.Param("username")
	board := c.Param("board")

	err := db.DeleteBoard(username, board)
	if err != nil {
		logger.Println(err)
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Could not delete the %s board from the database!", board)})
		return
	}

	c.JSON(http.StatusOK, gin.H{})
}

func getBoardConfigHandler(c *gin.Context) {
	var boardData dashboard.BoardData

	// username := c.Param("username")
	board := c.Param("board")

	boardData.Board = board
	err := dashboard.ReadBoardConfig(&boardData)
	if err != nil {
		logger.Println(err)
		c.JSON(http.StatusOK, gin.H{"error": "Could not communicate with the server!"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"board": boardData.Board})
}