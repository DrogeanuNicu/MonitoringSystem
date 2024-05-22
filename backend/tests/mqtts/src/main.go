package main

import (
	"backend/src/configParser"
	"backend/src/dashboard"
	"backend/src/mqtt"
	"context"
	"crypto/tls"
	"crypto/x509"
	"encoding/json"
	"flag"
	"fmt"
	"math/rand"
	"net/url"
	"os"
	"time"

	"github.com/eclipse/paho.golang/autopaho"
	"github.com/eclipse/paho.golang/paho"
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
func main() {
	var username string
	var board string
	var config configParser.Config
	var configFile string

	flag.StringVar(&configFile, "c", "../../../backend.config.json", "The config file")
	flag.StringVar(&username, "u", "test", "User to receive MQTTS messages")
	flag.StringVar(&board, "b", "test", "board to send MQTTS messages")
	flag.Parse()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	configParser.ReadConfig(&configFile, &config)
	dashboard.Init(&config.Dashboard)

	clientCert, err := tls.LoadX509KeyPair(config.Mqtts.Cert, config.Mqtts.Key)
	if err != nil {
		panic(err)
	}

	caCert, err := os.ReadFile(config.Mqtts.Ca)
	if err != nil {
		panic(err)
	}

	caCertPool := x509.NewCertPool()
	if !caCertPool.AppendCertsFromPEM(caCert) {
		panic("Failed to append CA certificate to pool!")
	}

	clientID := fmt.Sprintf("test_id_%s_%s", username, board)
	u, err := url.Parse(fmt.Sprintf("mqtts://%s:%d", config.Mqtts.Address, config.Mqtts.Port))
	if err != nil {
		panic(err)
	}

	cliCfg := autopaho.ClientConfig{
		ServerUrls: []*url.URL{u},
		TlsCfg: &tls.Config{
			RootCAs:      caCertPool,
			Certificates: []tls.Certificate{clientCert},
		},
		KeepAlive:                     20,
		CleanStartOnInitialConnection: false,
		SessionExpiryInterval:         60,
		OnConnectionUp:                onConnectionUp,
		OnConnectError:                onConnectError,
		ClientConfig: paho.ClientConfig{
			ClientID:           clientID,
			OnPublishReceived:  []func(paho.PublishReceived) (bool, error){onPublishReceived},
			OnClientError:      onClientError,
			OnServerDisconnect: onServerDisconnect,
		},
	}

	c, err := autopaho.NewConnection(ctx, cliCfg)
	if err != nil {
		panic(err)
	}

	if err = c.AwaitConnection(ctx); err != nil {
		panic(err)
	}

	var boardConf dashboard.BoardConfig
	err = dashboard.FsReadBoardConfig(username, board, &boardConf)
	if err != nil {
		panic(err)
	}

	parameters := make([]interface{}, len(boardConf.Parameters))

	topic := fmt.Sprintf("%s/%s", username, board)
	for {
		for i := 0; i < len(parameters); i++ {
			// TODO: add random value based on the type of the parameter
			parameters[i] = rand.Uint32() % 1000
		}

		jsonMessage, err := json.Marshal(parameters)
		if err != nil {
			panic(err)
		}

		fmt.Println(string(jsonMessage))

		mqttsMessage := paho.Publish{
			QoS:     1,
			Topic:   topic,
			Payload: jsonMessage,
		}
		mqtt.Send(&mqttsMessage)

		time.Sleep(1 * time.Second)
	}
}

func onConnectionUp(cm *autopaho.ConnectionManager, connAck *paho.Connack) {
}

func onConnectError(err error) {
}

func onPublishReceived(pr paho.PublishReceived) (bool, error) {
	return true, nil
}

func onClientError(err error) {
}

func onServerDisconnect(d *paho.Disconnect) {
}

func randomString(n int) string {
	charset := "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	charsetLen := uint32(len(charset))
	var result string
	for i := 0; i < n; i++ {
		randIndex := rand.Uint32() % charsetLen
		result += string(charset[randIndex])
	}
	return result
}
