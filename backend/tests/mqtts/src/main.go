package main

import (
	"backend/src/configParser"
	"context"
	"crypto/tls"
	"crypto/x509"
	"encoding/json"
	"flag"
	"fmt"
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
type Message struct {
	Message string `json:"message"`
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

	topic := fmt.Sprintf("%s/%s", username, board)
	for {
		message := Message{
			Message: "This is my test message!",
		}

		jsonMessage, err := json.Marshal(message)
		if err != nil {
			panic(err)
		}

		mqttsMessage := paho.Publish{
			QoS:     1,
			Topic:   topic,
			Payload: jsonMessage,
		}
		c.Publish(ctx, &mqttsMessage)

		fmt.Println(message)
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