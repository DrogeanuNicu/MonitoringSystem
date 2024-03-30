package dashboard

import (
	"log"
	"os"
)

// ================================================================================================
//
//	Global Types
//
// ================================================================================================
type DashboardConfig struct {
	DataPath string `json:"DataPath"`
}

type BoardData struct {
	Board string
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
var logger = log.New(os.Stdout, "[DSHBD] ", log.Ldate|log.Ltime)

var dataPath string

// ================================================================================================
//
//	Global Functions
//
// ================================================================================================
func Init(config *DashboardConfig) {

	dataPath = config.DataPath

	_, err := os.Stat(dataPath)
	if err != nil {
		if os.IsNotExist(err) {
			panic(err)
		}
	}
}

// ================================================================================================
//
//	Local Functions
//
// ================================================================================================
