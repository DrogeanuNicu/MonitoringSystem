package mqtt

import (
	"context"
	"crypto/tls"
	"crypto/x509"
	"errors"
	"fmt"
	"log"
	"net/url"
	"os"
	"sync"

	"github.com/eclipse/paho.golang/autopaho"
	"github.com/eclipse/paho.golang/paho"
)

type sendQueueType struct {
	ch   chan paho.Publish
	wg   sync.WaitGroup
	stop chan struct{}
}

var debug bool
var mqttLogger = log.New(os.Stdout, "[MQTT] ", log.Ldate|log.Ltime)
var sendQueue sendQueueType

func Init(ctxPtr *context.Context, numOfClients int, server string, port int, topic string,
	sendQueueChSize int, ca string, cert string, privateKey string, isDebugOn bool) error {

	if ca == "" {
		panic("Please provide the path to the MQTTS TLS certificate authority")
	}

	if cert == "" {
		panic("Please provide the path to the MQTTS TLS certificate")
	}

	if privateKey == "" {
		panic("Please provide the path to the MQTTS TLS private key")
	}

	debug = isDebugOn
	sendQueue.ch = make(chan paho.Publish, sendQueueChSize)
	sendQueue.stop = make(chan struct{})

	u, err := url.Parse(fmt.Sprintf("mqtts://%s:%d", server, port))
	if err != nil {
		mqttLogger.Printf("The broker url, %s, is invalid!\n", u)
		return err
	}

	for i := 0; i < numOfClients; i++ {
		clientID := fmt.Sprintf("Client_%d", i)
		go createClient(ctxPtr, u, topic, clientID, ca, cert, privateKey)
	}

	return nil
}

func Send(message paho.Publish) error {
	if len(sendQueue.ch) < cap(sendQueue.ch) {
		sendQueue.ch <- message
		return nil
	}
	return errors.New("The message queue is full")
}

func DeInit() {
	close(sendQueue.ch)
	sendQueue.wg.Wait()
	close(sendQueue.stop)
}

func createClient(ctxPtr *context.Context, u *url.URL, topic string,
	clientID string, ca string, cert string, privateKey string) {

	clientCert, err := tls.LoadX509KeyPair(cert, privateKey)
	if err != nil {
		mqttLogger.Printf("Error loading client certificate and private key: %s\n", err)
		panic(err)
	}

	caCert, err := os.ReadFile(ca)
	if err != nil {
		mqttLogger.Printf("Error loading CA certificate: %s\n", err)
		panic(err)
	}

	caCertPool := x509.NewCertPool()
	if !caCertPool.AppendCertsFromPEM(caCert) {
		mqttLogger.Println("Error appending CA certificate to pool.")
		panic("Failed to append CA certificate to pool")
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

	if debug {
		clientLogger := log.New(os.Stdout, "[MQTT] ", log.Ldate|log.Ltime)
		cliCfg.Debug = clientLogger
		cliCfg.Errors = clientLogger
	}

	c, err := autopaho.NewConnection(*ctxPtr, cliCfg)
	if err != nil {
		mqttLogger.Printf("The client %s could not be created!\n", clientID)
		panic(err)
	}

	if err = c.AwaitConnection(*ctxPtr); err != nil {
		mqttLogger.Printf("The client %s could not connect to the broker!\n", clientID)
		panic(err)
	}

	if _, err := c.Subscribe(context.Background(), &paho.Subscribe{
		Subscriptions: []paho.SubscribeOptions{
			{Topic: topic, QoS: 1},
		},
	}); err != nil {
		mqttLogger.Printf("The client %s could not subscribe to the provided topic!\n", clientID)
		panic(err)
	}
	mqttLogger.Printf("The client %s subscribed to %s!\n", clientID, topic)
	sendQueue.wg.Add(1)

	for {
		select {
		case message := <-sendQueue.ch:
			_, err = c.Publish(*ctxPtr, &message)
			if err != nil {
				mqttLogger.Printf("The client %s could not send the message: %s: %s!\n", clientID, message.Topic, message.Payload)
			}
			continue
		case <-sendQueue.stop:
			err = c.Disconnect(*ctxPtr)
			if err != nil {
				mqttLogger.Printf("The client %s could not disconnect!", clientID)
			}
			return
		}
	}
}

func onConnectionUp(cm *autopaho.ConnectionManager, connAck *paho.Connack) {
	if debug {
		mqttLogger.Println("Connection up")
	}
}

func onConnectError(err error) {
	mqttLogger.Printf("Error while attempting connection: %s\n", err)
}

func onPublishReceived(pr paho.PublishReceived) (bool, error) {
	mqttLogger.Printf("%s: %s \n", pr.Packet.Topic, pr.Packet.Payload)
	return true, nil
}

func onClientError(err error) {
	mqttLogger.Printf("Client error: %s\n", err)
}

func onServerDisconnect(d *paho.Disconnect) {
	if d.Properties != nil {
		mqttLogger.Printf("Server requested disconnect: %s\n", d.Properties.ReasonString)
	} else {
		mqttLogger.Printf("Server requested disconnect; reason code: %d\n", d.ReasonCode)
	}
}
