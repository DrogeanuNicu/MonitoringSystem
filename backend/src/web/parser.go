package web

import (
	"backend/src/dashboard"

	"github.com/gin-gonic/gin"
)

// ================================================================================================
//
//	Global Types
//
// ================================================================================================

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

// ================================================================================================
//
//	Global Functions
//
// ================================================================================================

// ================================================================================================
//
//	Local Functions
//
// ================================================================================================
func parseBoardData(c *gin.Context, boardData *dashboard.BoardData) error {

	err := c.BindJSON(boardData)
	if err != nil {
		logger.Printf("Error binding JSON: %s", err)
		return err
	}

	return nil
}