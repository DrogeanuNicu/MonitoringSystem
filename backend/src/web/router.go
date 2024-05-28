package web

import (
	"backend/src/auth"
	"backend/src/dashboard"
	"backend/src/db"
	"backend/src/mqtt"
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
	router.POST("/api/:username/logout", auth.Middleware(), logoutHandler)
	router.GET("/api/:username/boards", auth.Middleware(), getBoardsHandler)
	router.POST("/api/:username/add/:board", auth.Middleware(), addBoardHandler)
	router.POST("/api/:username/edit/:board", auth.Middleware(), editBoardHandler)
	router.POST("/api/:username/delete/:board", auth.Middleware(), deleteBoardHandler)
	router.GET("/api/:username/config/:board", auth.Middleware(), getBoardConfigHandler)
	router.GET("/api/:username/download/:board", auth.Middleware(), downloadBoardDataHandler)
	router.GET("/api/:username/data/:board", auth.Middleware(), getBoardDataHandler)
	router.GET("/api/:username/download/update/binary/:board", auth.Middleware(), getOtaUpdateBin)
	router.POST("/api/:username/trigger/ota/update/:board", auth.Middleware(), triggerOtaUpdate)
	router.POST("/api/:username/reset/ota/status/:board", auth.Middleware(), resetOtaStatus)
	router.GET("/api/:username/get/ota/status/:board", auth.Middleware(), getOtaStatus)

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

	token := auth.GenerateJwtToken(username)
	c.JSON(http.StatusOK, gin.H{"token": token})
}

func logoutHandler(c *gin.Context) {
	username := c.Param("username")

	dashboard.UserLogout(username)
	c.JSON(http.StatusOK, gin.H{})
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

	go dashboard.FsAddUser(username)

	token := auth.GenerateJwtToken(username)
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
	var boardConf dashboard.BoardConfig

	err := parseBoardConf(c, &boardConf)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid board config!"})
	}

	err = db.AddBoard(username, &boardConf)
	if err != nil {
		logger.Println(err)
		c.JSON(http.StatusOK, gin.H{"error": fmt.Sprintf("Could not add the %s board into the database!", boardConf.Board)})
		return
	}

	go dashboard.FsAddBoard(username, &boardConf)

	/* TODO: Make the Home page periodically fetch the full list of the boards => solves sync problem between different terminals */
	c.JSON(http.StatusOK, gin.H{})
}

func editBoardHandler(c *gin.Context) {
	username := c.Param("username")
	oldBoard := c.Param("board")
	var boardConf dashboard.BoardConfig

	err := parseBoardConf(c, &boardConf)
	if err != nil {
		logger.Println(err)
		c.JSON(http.StatusOK, gin.H{"error": "Invalid board data!"})
		return
	}

	err = db.EditBoard(username, &boardConf, oldBoard)
	if err != nil {
		logger.Println(err)
		c.JSON(http.StatusOK, gin.H{"error": fmt.Sprintf("Could not edit the %s board into the database!", boardConf.Board)})
		return
	}

	go dashboard.FsEditBoardData(username, &boardConf, oldBoard)

	c.JSON(http.StatusOK, gin.H{})
}

func deleteBoardHandler(c *gin.Context) {
	username := c.Param("username")
	board := c.Param("board")

	err := db.DeleteBoard(username, board)
	if err != nil {
		logger.Println(err)
		c.JSON(http.StatusOK, gin.H{"error": fmt.Sprintf("Could not delete the %s board from the database!", board)})
		return
	}

	go dashboard.FsDeleteBoard(username, board)

	c.JSON(http.StatusOK, gin.H{})
}

func getBoardConfigHandler(c *gin.Context) {
	var boardConf dashboard.BoardConfig

	username := c.Param("username")
	board := c.Param("board")

	boardConf.Board = board
	err := dashboard.FsReadBoardConfig(username, board, &boardConf)
	if err != nil {
		logger.Println(err)
		c.JSON(http.StatusOK, gin.H{"error": "Could not communicate with the server!"})
		return
	}

	c.JSON(http.StatusOK, boardConf)
}

func downloadBoardDataHandler(c *gin.Context) {
	username := c.Param("username")
	board := c.Param("board")

	filePath, err := dashboard.FsDownloadBoardData(username, board)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"error": fmt.Sprintf("The CSV file of the '%s' board is not present on the server!", board)})
		return
	}

	c.FileAttachment(filePath, "board.csv")
}

func getBoardDataHandler(c *gin.Context) {
	username := c.Param("username")
	board := c.Param("board")

	boardData, err := dashboard.GetBoardData(&username, &board)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"error": fmt.Sprintf("Could not get the data of the board: %s", board)})
		return
	}

	c.JSON(http.StatusOK, boardData)
}

func getOtaUpdateBin(c *gin.Context) {
	username := c.Param("username")
	board := c.Param("board")

	filePath, err := dashboard.FsDownloadOtaUpdate(username, board)
	if err != nil {
		logger.Println(err)
		c.JSON(http.StatusOK, gin.H{"error": fmt.Sprintf("The BIN file of the '%s' board is not present on the server!", board)})
		return
	}
	dashboard.SetOtaStatus(&username, &board, dashboard.OTA_BOARD_REQUESTED_BIN)

	c.FileAttachment(filePath, "update.bin")
}

func triggerOtaUpdate(c *gin.Context) {
	username := c.Param("username")
	board := c.Param("board")

	file, err := c.FormFile("file")
	if err != nil {
		logger.Println(err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	dst := dashboard.GetOtaBinPath(&username, &board)
	if err := c.SaveUploadedFile(file, dst); err != nil {
		logger.Println(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	dashboard.SetOtaStatus(&username, &board, dashboard.OTA_BINARY_UPLOADED)
	go mqtt.HandleOtaHandshake(username, board)

	c.JSON(http.StatusOK, gin.H{"message": "File uploaded successfully"})
}

func resetOtaStatus(c *gin.Context) {
	username := c.Param("username")
	board := c.Param("board")

	dashboard.SetOtaStatus(&username, &board, dashboard.OTA_NO_STATUS)

	c.JSON(http.StatusOK, gin.H{})
}

func getOtaStatus(c *gin.Context) {
	username := c.Param("username")
	board := c.Param("board")

	status, err := dashboard.GetOtaStatus(&username, &board)
	if err == nil {
		c.JSON(http.StatusOK, gin.H{"status": status})
		return
	}

	logger.Println(err)
	c.JSON(http.StatusOK, gin.H{"status": dashboard.OTA_NO_STATUS})
}
