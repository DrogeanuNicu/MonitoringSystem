package configParser

import (
	"backend/src/dashboard"
	"backend/src/db"
	"backend/src/mqtt"
	"backend/src/web"
	"encoding/json"
	"os"
	"path/filepath"

	_ "github.com/lib/pq"
)

// ================================================================================================
//
//	Global Types
//
// ================================================================================================
type Config struct {
	Debug     bool                      `json:"debug"`
	Https     web.HttpsConfig           `json:"https"`
	Mqtts     mqtt.MqttsConfig          `json:"mqtts"`
	Database  db.DatabaseConfig         `json:"database"`
	Dashboard dashboard.DashboardConfig `json:"dashboard"`
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

// ================================================================================================
//
//	Global Functions
//
// ================================================================================================
func ReadConfig(path *string, config *Config) {
	var confFileAbsPath string
	var err error

	confFileAbsPath = getAbsPath(path)
	file, err := os.Open(confFileAbsPath)
	if err != nil {
		panic("Could not read the config file!")
	}

	err = json.NewDecoder(file).Decode(config)
	if err != nil {
		panic("Invalid JSON config file!")
	}
	defer file.Close()

	confFileDir := filepath.Dir(confFileAbsPath)
	config.Https.Cert = filepath.Join(confFileDir, config.Https.Cert)
	config.Https.Key = filepath.Join(confFileDir, config.Https.Key)
	config.Mqtts.Ca = filepath.Join(confFileDir, config.Mqtts.Ca)
	config.Mqtts.Cert = filepath.Join(confFileDir, config.Mqtts.Cert)
	config.Mqtts.Key = filepath.Join(confFileDir, config.Mqtts.Key)
	config.Dashboard.DataPath = filepath.Join(confFileDir, config.Dashboard.DataPath)
}

// ================================================================================================
//
//	Local Functions
//
// ================================================================================================
func getAbsPath(path *string) string {
	var absPath string

	if filepath.IsAbs(*path) {
		absPath = *path
	} else {
		binaryDir, err := filepath.Abs(filepath.Dir(os.Args[0]))
		if err != nil {
			return ""
		}
		absPath = filepath.Join(binaryDir, *path)
	}

	return absPath
}
