package main

import (
	"backend/src/mqtt"
	"backend/src/router"
	"context"
	"flag"
	"fmt"
)

func main() {
	var err error
	var debug bool
	var webAddress string
	var webPort int
	var webCert string
	var webPrivateKey string
	var numClients int
	var mqttBrokerAdress string
	var mqttBrokerPort int
	var mqttTopic string
	var mqttSendChSize int

	flag.BoolVar(&debug, "debug", false, "Print debug logs")
	flag.StringVar(&webAddress, "web-address", "localhost", "The address of the web server")
	flag.IntVar(&webPort, "web-port", 5000, "The port of the web server")
	flag.StringVar(&webCert, "web-cert", "", "The TLS certificate to be used by the web server. Has to be relative to the binary")
	flag.StringVar(&webPrivateKey, "web-private-key", "", "The private key to be used by the web server. Has to be relative to the binary")
	flag.IntVar(&numClients, "mqtt-clients", 4, "The number of MQTT clients in the shared group")
	flag.StringVar(&mqttBrokerAdress, "mqtt-address", "localhost", "The address of the MQTT broker")
	flag.IntVar(&mqttBrokerPort, "mqtt-port", 1883, "The port of the MQTT broker")
	flag.StringVar(&mqttTopic, "mqtt-topic", "$share/golang/#", "The shared MQTT topic")
	flag.IntVar(&mqttSendChSize, "mqtt-channel-size", 100, "Size of channel containing pending MQTT messages to be sent")
	flag.Parse()

	if webCert == "" {
		panic("Please provide the path to the TLS certificate")
	}

	if webPrivateKey == "" {
		panic("Please provide the path to the TLS private key")
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	err = mqtt.Init(&ctx, numClients, mqttBrokerAdress, mqttBrokerPort, mqttTopic, mqttSendChSize, debug)
	if err != nil {
		panic(fmt.Sprintf("Could not connect all MQTT clients! %v\n", err))
	}

	// time.Sleep(2 * time.Second)
	// message := paho.Publish{
	// 	QoS:     1,
	// 	Topic:   "topic",
	// 	Payload: []byte("Asta e mesajul meu de test!"),
	// }
	// mqtt.Send(message)

	err = router.Init(webAddress, webPort, webCert, webPrivateKey, debug)
	if err != nil {
		panic(fmt.Sprintf("The HTPPS web server could not start! %v\n", err))
	}
}
