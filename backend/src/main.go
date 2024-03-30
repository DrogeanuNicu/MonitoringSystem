package main

import (
	"backend/src/dashboard"
	"backend/src/db"
	"backend/src/mqtt"
	"backend/src/web"
	"context"
	"encoding/json"
	"flag"
	"os"
	"path/filepath"

	_ "github.com/lib/pq"
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
type config struct {
	Debug     bool                      `json:"debug"`
	Https     web.HttpsConfig           `json:"https"`
	Mqtts     mqtt.MqttsConfig          `json:"mqtts"`
	Database  db.DatabaseConfig         `json:"database"`
	Dashboard dashboard.DashboardConfig `json:"dashboard"`
}

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
func main() {
	var config config
	var configFile string

	flag.StringVar(&configFile, "config", "../backend.config.json", "The config file")
	flag.Parse()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	readConfig(&configFile, &config)
	go db.Init(&config.Database)
	go mqtt.Init(&ctx, &config.Mqtts, config.Debug)
	go dashboard.Init(&config.Dashboard)
	web.Init(&config.Https, config.Debug)
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

func readConfig(path *string, config *config) error {
	var filePath string
	var err error

	filePath = getAbsPath(path)
	file, err := os.Open(filePath)
	if err != nil {
		return err
	}
	defer file.Close()

	err = json.NewDecoder(file).Decode(config)
	if err != nil {
		return err
	}

	config.Https.Cert = getAbsPath(&config.Https.Cert)
	config.Https.Key = getAbsPath(&config.Https.Key)
	config.Mqtts.Ca = getAbsPath(&config.Mqtts.Ca)
	config.Mqtts.Cert = getAbsPath(&config.Mqtts.Cert)
	config.Mqtts.Key = getAbsPath(&config.Mqtts.Key)
	config.Dashboard.DataPath = getAbsPath(&config.Dashboard.DataPath)

	return nil
}

// time.Sleep(2 * time.Second)
// message := paho.Publish{
// 	QoS:     1,
// 	Topic:   "topic",
// 	Payload: []byte("This is my test message!"),
// }
// mqtt.Send(message)
