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

type IParameter struct {
	Name string
	Uom  string
}

type IChartOy struct {
	Index uint
	Color string
}

type IChart struct {
	Name string
	Type string
	Ox   uint
	Oy   []IChartOy
}

type BoardConfig struct {
	Board string

	Parameters []IParameter
	Charts     []IChart
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

func UserLogout(username string) {
}

func GetBoardData(username string, board string) {
}

// ================================================================================================
//
//	Local Functions
//
// ================================================================================================
