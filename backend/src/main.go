package main

import (
	"backend/src/db"
	"backend/src/mqtt"
	"backend/src/router"
	"context"
	"flag"
	"fmt"

	_ "github.com/lib/pq"
)

func main() {
	var err error
	var debug bool
	var webAddress string
	var webPort int
	var webCert string
	var webPrivateKey string
	var mqttNumClients int
	var mqttBrokerAdress string
	var mqttBrokerPort int
	var mqttTopic string
	var mqttSendChSize int
	var mqttCa string
	var mqttCert string
	var mqttKey string
	var dbHost string
	var dbPort int
	var dbUser string
	var dbPassword string
	var dbName string

	flag.BoolVar(&debug, "debug", false, "Print debug logs")
	flag.StringVar(&webAddress, "web-address", "localhost", "The address of the web server")
	flag.IntVar(&webPort, "web-port", 5000, "The port of the web server")
	flag.StringVar(&webCert, "web-cert", "", "The HTTP TLS certificate.")
	flag.StringVar(&webPrivateKey, "web-private-key", "", "The HTTP TLS key.")
	flag.IntVar(&mqttNumClients, "mqtt-clients", 4, "The number of MQTT clients in the shared group")
	flag.StringVar(&mqttBrokerAdress, "mqtt-address", "localhost", "The address of the MQTT broker")
	flag.IntVar(&mqttBrokerPort, "mqtt-port", 8883, "The port of the MQTT broker")
	flag.StringVar(&mqttTopic, "mqtt-topic", "$share/golang/#", "The shared MQTT topic")
	flag.IntVar(&mqttSendChSize, "mqtt-channel-size", 100, "Size of channel containing pending MQTT messages to be sent")
	flag.StringVar(&mqttCa, "mqtt-ca", "", "The MQTT TLS certificate authority")
	flag.StringVar(&mqttCert, "mqtt-cert", "", "The MQTT TLS certificate ")
	flag.StringVar(&mqttKey, "mqtt-key", "", "The MQTTS TLS certificate key")
	flag.StringVar(&dbHost, "db-host", "localhost", "The address of the database")
	flag.IntVar(&dbPort, "db-port", 5432, "The port of the database")
	flag.StringVar(&dbUser, "db-user", "postgres", "The user of the database")
	flag.StringVar(&dbPassword, "db-password", "ParolaDb", "The password of the database")
	flag.StringVar(&dbName, "db-name", "monitoring_system", "The name of the database")
	flag.Parse()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	err = mqtt.Init(&ctx, mqttNumClients, mqttBrokerAdress, mqttBrokerPort, mqttTopic,
		mqttSendChSize, mqttCa, mqttCert, mqttKey, debug)
	if err != nil {
		panic(fmt.Sprintf("Could not connect all MQTT clients! %v\n", err))
	}

	// time.Sleep(2 * time.Second)
	// message := paho.Publish{
	// 	QoS:     1,
	// 	Topic:   "topic",
	// 	Payload: []byte("This is my test message!"),
	// }
	// mqtt.Send(message)

	err = db.Init(dbHost, dbPort, dbUser, dbPassword, dbName)
	if err != nil {
		panic(fmt.Sprintf("Could not connect to the database! %v\n", err))
	}

	err = router.Init(webAddress, webPort, webCert, webPrivateKey, debug)
	if err != nil {
		panic(fmt.Sprintf("The HTPPS web server could not start! %v\n", err))
	}
}
