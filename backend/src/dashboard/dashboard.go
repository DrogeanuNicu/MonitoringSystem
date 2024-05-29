package dashboard

import (
	"backend/src/auth"
	"fmt"
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
	DataPath                string `json:"DataPath"`
	DefaultChartsDataLength uint64 `json:"DefaultChartsDataLength"`
	MaxSecondsOfInactivity  int64  `json:"MaxSecondsOfInactivity"`
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
	Board            string
	MaxElemsPerChart uint

	Parameters []IParameter
	Maps       []IMap
	Charts     []IChart
	Gauges     []IGauge
}

type BoardData struct {
	Data             [][]string
	LastTimeStamp    int64
	MaxElemsPerChart uint64
}

type BoardAccess struct {
	Packet *BoardData
	Mu     sync.Mutex
}

type OtaControl struct {
	Status     int
	Mu         sync.Mutex
	LastUpdate int64
	Token      string
}

type BoardMap map[string]*BoardAccess
type UserMap map[string]BoardMap

type OtaStatusBoard map[string]*OtaControl
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

func GetBoardData(username *string, board *string, maxElemsPerChart uint64) (BoardData, error) {
	if _, userExists := dshbd[*username]; !userExists {
		dshbd[*username] = make(BoardMap)
	}

	if _, boardExists := dshbd[*username][*board]; !boardExists {
		dshbd[*username][*board] = &BoardAccess{
			Packet: &BoardData{
				LastTimeStamp:    time.Now().Unix(),
				MaxElemsPerChart: maxElemsPerChart,
			},
		}
		dshbd[*username][*board].Mu.Lock()
		err := fsReadLastBoardData(username, board, &(dshbd[*username][*board].Packet.Data), maxElemsPerChart)
		dshbd[*username][*board].Mu.Unlock()
		return *dshbd[*username][*board].Packet, err
	}

	dshbd[*username][*board].Mu.Lock()
	dshbd[*username][*board].Packet.LastTimeStamp = time.Now().Unix()

	if dshbd[*username][*board].Packet.MaxElemsPerChart != maxElemsPerChart {
		dshbd[*username][*board].Packet.MaxElemsPerChart = maxElemsPerChart
		err := fsReadLastBoardData(username, board, &(dshbd[*username][*board].Packet.Data), maxElemsPerChart)
		dshbd[*username][*board].Mu.Unlock()
		return *dshbd[*username][*board].Packet, err
	}

	dshbd[*username][*board].Mu.Unlock()
	return *dshbd[*username][*board].Packet, nil
}

func AppendBoardData(username *string, board *string, newData *[]string) error {
	err := fsAppendBoardData(username, board, newData)
	if err != nil {
		return err
	}

	if pBoard, isBoardActive := dshbd[*username][*board]; isBoardActive {
		pBoard.Mu.Lock()
		defer pBoard.Mu.Unlock()

		if uint64(len(pBoard.Packet.Data)) < dshbd[*username][*board].Packet.MaxElemsPerChart {
			pBoard.Packet.Data = append(pBoard.Packet.Data, *newData)
		} else {
			for i := 1; i < len(pBoard.Packet.Data); i++ {
				pBoard.Packet.Data[i-1] = pBoard.Packet.Data[i]
			}
			pBoard.Packet.Data[len(pBoard.Packet.Data)-1] = *newData
		}
	}

	return nil
}

func GetOtaController(username *string, board *string) *OtaControl {
	if _, userExists := otaStatusMap[*username]; !userExists {
		return nil
	}

	if _, boardExists := otaStatusMap[*username][*board]; !boardExists {
		return nil
	}

	return otaStatusMap[*username][*board]
}

func GetOtaStatus(username *string, board *string) (int, error) {
	if _, userExists := otaStatusMap[*username]; !userExists {
		return OTA_NO_STATUS, fmt.Errorf("username %s not found", *username)
	}

	if _, boardExists := otaStatusMap[*username][*board]; !boardExists {
		return OTA_NO_STATUS, fmt.Errorf("board %s not found for username %s", *board, *username)
	}

	otaStatusMap[*username][*board].Mu.Lock()
	defer otaStatusMap[*username][*board].Mu.Unlock()
	otaStatusMap[*username][*board].LastUpdate = time.Now().Unix()
	return otaStatusMap[*username][*board].Status, nil
}

func SetOtaStatus(username *string, board *string, status int) {
	if _, isUserValid := otaStatusMap[*username]; !isUserValid {
		otaStatusMap[*username] = make(OtaStatusBoard)
	}

	if _, boardIsValid := otaStatusMap[*username][*board]; !boardIsValid {
		otaStatusMap[*username][*board] = &OtaControl{
			Status:     OTA_NO_STATUS,
			LastUpdate: time.Now().Unix(),
		}
	}

	otaStatusMap[*username][*board].Mu.Lock()
	defer otaStatusMap[*username][*board].Mu.Unlock()
	otaStatusMap[*username][*board].Status = status
	if otaStatusMap[*username][*board].Status == OTA_BINARY_UPLOADED {
		otaStatusMap[*username][*board].Token = auth.GenerateJwtToken(*username)
		otaStatusMap[*username][*board].LastUpdate = time.Now().Unix()
	}
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
				dshbd[u][b].Mu.Lock()
				if dshbd[u][b].Packet.LastTimeStamp < currentTime-config.MaxSecondsOfInactivity {
					dshbd[u][b].Mu.Unlock()
					delete(dshbd[u], b)
				} else {
					dshbd[u][b].Mu.Unlock()
				}
			}

			if len(dshbd[u]) == 0 {
				delete(dshbd, u)
			}
		}

		for u := range dshbd {
			for b := range otaStatusMap[u] {
				otaStatusMap[u][b].Mu.Lock()
				if otaStatusMap[u][b].LastUpdate < currentTime-config.MaxSecondsOfInactivity {
					otaStatusMap[u][b].Mu.Unlock()
					delete(otaStatusMap[u], b)
				} else {
					otaStatusMap[u][b].Mu.Unlock()
				}
			}

			if len(otaStatusMap[u]) == 0 {
				delete(otaStatusMap, u)
			}
		}
	}
}
