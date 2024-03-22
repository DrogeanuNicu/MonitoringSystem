package main

import (
	"backend/src/db"
	"backend/src/mqtt"
	"backend/src/router"
	"context"
	"encoding/json"
	"flag"
	"os"
	"path/filepath"

	_ "github.com/lib/pq"
)

type Config struct {
	Debug    bool               `json:"debug"`
	Https    router.HttpsConfig `json:"https"`
	Mqtts    mqtt.MqttsConfig   `json:"mqtts"`
	Database db.DatabaseConfig  `json:"database"`
}

func getAbsPath(path *string) (string, error) {
	var absPath string

	if filepath.IsAbs(*path) {
		absPath = *path
	} else {
		binaryDir, err := filepath.Abs(filepath.Dir(os.Args[0]))
		if err != nil {
			return "", err
		}
		absPath = filepath.Join(binaryDir, *path)
	}

	return absPath, nil
}

func readConfig(path *string, config *Config) error {
	var filePath string
	var err error

	filePath, err = getAbsPath(path)
	if err != nil {
		return err
	}

	file, err := os.Open(filePath)
	if err != nil {
		return err
	}
	defer file.Close()

	err = json.NewDecoder(file).Decode(config)
	if err != nil {
		return err
	}

	return nil
}

func main() {
	var config Config
	var configFile string

	flag.StringVar(&configFile, "config", "../backend.config.json", "The config file")
	flag.Parse()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	readConfig(&configFile, &config)
	go db.Init(&config.Database)
	go mqtt.Init(&ctx, &config.Mqtts, config.Debug)
	router.Init(&config.Https, config.Debug)
}

// time.Sleep(2 * time.Second)
// message := paho.Publish{
// 	QoS:     1,
// 	Topic:   "topic",
// 	Payload: []byte("This is my test message!"),
// }
// mqtt.Send(message)
