package dashboard

import (
	"log"
	"os"
	"time"
)

// ================================================================================================
//
//	Global Types
//
// ================================================================================================
type DashboardConfig struct {
	DataPath               string `json:"DataPath"`
	ChartsDataLength       int    `json:"ChartsDataLength"`
	MaxSecondsOfInactivity int64  `json:"MaxSecondsOfInactivity"`
}

type IParameter struct {
	Name string
	Uom  string
}

type IMap struct {
	Name string
	Lon  uint
	Lat  uint
	Alt  uint
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

type IGauge struct {
	Name  string
	Index uint
	Min   float64
	Max   float64
	Color string
}

type BoardConfig struct {
	Board string

	Parameters []IParameter
	Maps       []IMap
	Charts     []IChart
	Gauges     []IGauge
}

type BoardData struct {
	Data          [][]string
	LastTimeStamp int64
}

type BoardMap map[string]BoardData

type UserMap map[string]BoardMap

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

var config DashboardConfig
var dshbd UserMap = make(UserMap)

// ================================================================================================
//
//	Global Functions
//
// ================================================================================================
func Init(pConfig *DashboardConfig) {

	config = *pConfig

	_, err := os.Stat(config.DataPath)
	if err != nil {
		if os.IsNotExist(err) {
			panic(err)
		}
	}

	go startPeriodicCleanUp()
}

func UserLogout(username string) {
}

func GetBoardData(username *string, board *string) (BoardData, error) {
	if _, isBoardActive := dshbd[*username][*board]; !isBoardActive {
		dshbd[*username] = make(BoardMap)
		var boardData BoardData = BoardData{
			LastTimeStamp: time.Now().Unix(),
		}
		err := fsReadLastBoardData(username, board, &boardData.Data)

		if err != nil {
			return boardData, err
		}

		dshbd[*username][*board] = boardData
	} else {
		tempBoardData := dshbd[*username][*board]
		tempBoardData.LastTimeStamp = time.Now().Unix()

		dshbd[*username][*board] = tempBoardData
	}

	return dshbd[*username][*board], nil
}

func AppendBoardData(username *string, board *string, newData *[]string) error {
	err := fsAppendBoardData(username, board, newData)
	if err != nil {
		return err
	}

	if _, isBoardActive := dshbd[*username][*board]; isBoardActive {
		length := len(dshbd[*username][*board].Data)
		if length < config.ChartsDataLength {
			dshbd[*username][*board] = BoardData{
				Data:          append(dshbd[*username][*board].Data, *newData),
				LastTimeStamp: dshbd[*username][*board].LastTimeStamp,
			}

		} else {
			for i := 1; i < length; i++ {
				dshbd[*username][*board].Data[i-1] = dshbd[*username][*board].Data[i]
			}
			dshbd[*username][*board].Data[length-1] = *newData
		}
	}

	return nil
}

// ================================================================================================
//
//	Local Functions
//
// ================================================================================================
func startPeriodicCleanUp() {
	ticker := time.NewTicker(time.Duration(config.MaxSecondsOfInactivity) * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		currentTime := time.Now().Unix()

		for u, boards := range dshbd {
			for b, boardData := range boards {
				if boardData.LastTimeStamp < currentTime-config.MaxSecondsOfInactivity {
					delete(dshbd[u], b)
				}
			}

			if len(dshbd[u]) == 0 {
				delete(dshbd, u)
			}
		}
	}
}
