package main

import (
	"backend/mqtt"
	"backend/router"
	"context"
	"flag"
	"fmt"
)

func main() {
	var err error
	var debug bool
	var webAddress string
	var webPort int
	var mqttClients int
	var mqttBrokerAdress string
	var mqttBrokerPort int
	var mqttTopic string

	flag.BoolVar(&debug, "debug", false, "Print debug logs")
	flag.StringVar(&webAddress, "web-address", "localhost", "The address of the web server")
	flag.IntVar(&webPort, "web-port", 5000, "The port of the web server")
	flag.IntVar(&mqttClients, "mqtt-clients", 4, "The number of MQTT clients in the shared group")
	flag.StringVar(&mqttBrokerAdress, "mqtt-address", "localhost", "The address of the MQTT broker")
	flag.IntVar(&mqttBrokerPort, "mqtt-port", 1883, "The port of the MQTT broker")
	flag.StringVar(&mqttTopic, "mqtt-topic", "$share/golang/#", "The shared MQTT topic")
	flag.Parse()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	err = mqtt.Init(&ctx, mqttClients, mqttBrokerAdress, mqttBrokerPort, mqttTopic)
	if err != nil {
		panic(fmt.Sprintf("Could not connect all MQTT clients! %v", err))
	}

	err = router.Init(webAddress, webPort, debug)
	if err != nil {
		panic(fmt.Sprintf("The HTPP web server could not start! %v", err))
	}
}
