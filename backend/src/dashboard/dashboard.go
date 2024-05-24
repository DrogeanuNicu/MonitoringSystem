package dashboard

import (
	"log"
	"os"
	"sync"
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

type BoardAccess struct {
	Packet *BoardData
	Mu     sync.Mutex
}

type BoardMap map[string]*BoardAccess

type UserMap map[string]BoardMap

type OtaStatusBoard map[string]int
type OtaStatusMap map[string]OtaStatusBoard

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
const (
	OTA_NO_STATUS int = iota
	OTA_BINARY_UPLOADED
	OTA_MQTTS_MSG_SENT
	OTA_BOARD_REQUESTED_BIN
)

// ================================================================================================
//
//	Local Variables
//
// ================================================================================================
var logger = log.New(os.Stdout, "[DSHBD] ", log.Ldate|log.Ltime)

var config DashboardConfig
var dshbd UserMap = make(UserMap)
var otaStatusMap = make(OtaStatusMap)

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
			if err := os.Mkdir(config.DataPath, folderPermissions); err != nil {
				panic(err)
			}
		}
	}

	go startPeriodicCleanUp()
}

func UserLogout(username string) {
}

func GetBoardData(username *string, board *string) (BoardData, error) {
	if _, userExists := dshbd[*username]; !userExists {
		dshbd[*username] = make(BoardMap)
	}

	if _, boardExists := dshbd[*username][*board]; !boardExists {
		dshbd[*username][*board] = &BoardAccess{
			Packet: &BoardData{
				LastTimeStamp: time.Now().Unix(),
			},
		}
		dshbd[*username][*board].Mu.Lock()
		defer dshbd[*username][*board].Mu.Unlock()

		err := fsReadLastBoardData(username, board, &(dshbd[*username][*board].Packet.Data))
		return *dshbd[*username][*board].Packet, err
	}

	dshbd[*username][*board].Mu.Lock()
	defer dshbd[*username][*board].Mu.Unlock()

	dshbd[*username][*board].Packet.LastTimeStamp = time.Now().Unix()

	return *dshbd[*username][*board].Packet, nil
}

func AppendBoardData(username *string, board *string, newData *[]string) error {
	err := fsAppendBoardData(username, board, newData)
	if err != nil {
		return err
	}

	if board, isBoardActive := dshbd[*username][*board]; isBoardActive {
		board.Mu.Lock()
		defer board.Mu.Unlock()

		if len(board.Packet.Data) < config.ChartsDataLength {
			board.Packet.Data = append(board.Packet.Data, *newData)
		} else {
			for i := 1; i < len(board.Packet.Data); i++ {
				board.Packet.Data[i-1] = board.Packet.Data[i]
			}
			board.Packet.Data[len(board.Packet.Data)-1] = *newData
		}
	}

	return nil
}

func GetOtaStatus(username *string, board *string) int {
	return otaStatusMap[*username][*board]
}

func SetOtaStatus(username *string, board *string, status int) {
	if _, isUserValid := otaStatusMap[*username]; !isUserValid {
		otaStatusMap[*username] = make(OtaStatusBoard)
	}
	otaStatusMap[*username][*board] = status
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

		for u := range dshbd {
			for b := range dshbd[u] {
				if dshbd[u][b].Packet.LastTimeStamp < currentTime-config.MaxSecondsOfInactivity {
					delete(dshbd[u], b)
				}
			}

			if len(dshbd[u]) == 0 {
				delete(dshbd, u)
			}
		}

		for u := range dshbd {
			for b := range otaStatusMap[u] {
				if otaStatusMap[u][b] == OTA_NO_STATUS {
					delete(otaStatusMap[u], b)
				}
			}

			if len(otaStatusMap[u]) == 0 {
				delete(otaStatusMap, u)
			}
		}
	}
}
